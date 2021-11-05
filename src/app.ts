import * as ethers from 'ethers'
import * as dotenv from 'dotenv'
import { Client } from 'pg'
import moment from 'moment'

dotenv.config({ path: __dirname + '/.env' })

const provider = new ethers.providers.InfuraProvider('homestead', {
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

async function main() {
  try {
    client.connect()
    console.log('Postgres connected!')
  }
  catch (err) {
    console.error('Postgres error!', err.stack)
  }
}

main()

provider.on('block', async (blockNumber) => {
  const block = await provider.getBlockWithTransactions(blockNumber)

  const queryBlock = `INSERT INTO public.block(hash, parent_hash, "number", "timestamp",
    nonce, difficulty, gas_limit, gas_used, miner, extra_data, wei_spent) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`

  const queryTransaction = `INSERT INTO transaction (block_id, hash) VALUES ($1, $2)`

  const queryFirstBlock = `SELECT * FROM block ORDER BY id DESC LIMIT 1`

  const queryBlocksBetweenTimestamps = `SELECT * FROM block WHERE "timestamp" BETWEEN $1 AND $2`

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
      const { rows } = await client.query(queryBlocksBetweenTimestamps, [
        lastBlockTimestamp.clone().startOf('minutes').unix().toString(), lastBlockTimestamp.unix().toString()])
      console.log(rows)

      const ethUsedInDay = rows.reduce((a, b) => {
        return a.add(b.wei_spent)
      },
        ethers.BigNumber.from(0))

      console.log('Number of blocks:', rows.length)
      console.log('ETH used:', ethers.utils.formatEther(ethUsedInDay.toString()))
    }

  } catch (err) {
    await client.query('ROLLBACK')
    console.log(err.stack)
  }
})

provider.on('error', (err) => {
  console.error('Error on block', err)
})