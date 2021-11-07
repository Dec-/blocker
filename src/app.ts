import * as ethers from 'ethers'
import * as dotenv from 'dotenv'
import { Client } from 'pg'
import moment from 'moment'
import { abi } from './abi'

// It's not good practice to hold secrets on Git but for demo i think its fine
dotenv.config({ path: __dirname + '/.env' })

// If provider disconected we need to collect from last block in DB
const provider = new ethers.providers.InfuraProvider('homestead', {
  projectId: process.env.INFURA_PROJECT_ID,
  projectSecret: process.env.INFURA_PROJECT_SECRET
})

const providerRopsten = new ethers.providers.InfuraProvider('ropsten', {
  projectId: process.env.INFURA_PROJECT_ID,
  projectSecret: process.env.INFURA_PROJECT_SECRET
})

const client = new Client({
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER
})

const queryBlock = `INSERT INTO public.block(hash, parent_hash, "number", "timestamp",
nonce, difficulty, gas_limit, gas_used, miner, extra_data, wei_spent) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`
const queryTransaction = `INSERT INTO transaction (block_id, hash) VALUES ($1, $2)`
const queryFirstBlock = `SELECT * FROM block ORDER BY id DESC LIMIT 1`
const queryBlocksBetweenTimestamps = `SELECT * FROM block WHERE "timestamp" BETWEEN $1 AND $2`

async function main() {
  try {
	client.connect()
	//Use better logging for production (Winston, Pino)
    console.log('Postgres connected!')
  }
  catch (err) {
    console.error('Postgres error!', err.stack)
  }
}

main()

provider.on('block', async (blockNumber) => {
  const block = await provider.getBlockWithTransactions(blockNumber)

  const ethUsed = block.transactions.reduce((a, b) => {
    return a.add(b.gasLimit.mul(b.gasPrice))
  },
    ethers.BigNumber.from(0))

  try {
    const firstBlock = await client.query(queryFirstBlock)

    await client.query('BEGIN')

    const resBlock = await client.query(queryBlock,
      [block.hash, block.parentHash, block.number, block.timestamp, block.nonce, block.difficulty,
      block.gasLimit.toNumber(), block.gasUsed.toNumber(), block.miner, block.extraData, ethUsed.toString()])

    for (const transection of block.transactions) {
      await client.query(queryTransaction, [resBlock.rows[0].id, transection.hash])
    }

    await client.query('COMMIT')

    if (firstBlock.rowCount === 0) {
      return
    }

    const lastBlockTimestamp = moment.unix(firstBlock.rows[0].timestamp)
    const newBlockTimestamp = moment.unix(block.timestamp)

    if (!lastBlockTimestamp.isSame(newBlockTimestamp, 'minutes')) {
      await callSmartContract(lastBlockTimestamp)
    }

  } catch (err) {
    await client.query('ROLLBACK')
    console.log(err.stack)
  }
})

provider.on('error', (err) => {
  console.error('Error on block', err)
})

async function callSmartContract(lastBlockTimestamp: moment.Moment) {
  const startTimestamp = lastBlockTimestamp.clone().startOf('minutes').unix()

  const { rows } = await client.query(queryBlocksBetweenTimestamps, [
    startTimestamp.toString(), lastBlockTimestamp.unix().toString()
  ])
  const ethUsedInDay = rows.reduce((a, b) => {
    return a.add(b.wei_spent)
  }, ethers.BigNumber.from(0))
  console.log(rows)
  console.log('Number of blocks:', rows.length)
  console.log('ETH used:', ethers.utils.formatEther(ethUsedInDay.toString()))
  console.log('WEI used:', ethUsedInDay.toString())
  console.log(startTimestamp)

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, providerRopsten)
  const signer = wallet.connect(providerRopsten)

  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer)

  // Sometimes we need to increase GWEI on mainnet
  await contract.setDayData(startTimestamp, rows.length, ethUsedInDay.toString())
}

// Read logs if needed
/* let eventFilter = contract.filters.DayAdded()
  let events = await contract.queryFilter(eventFilter)
  console.log(events[0].args[0].toString()) */