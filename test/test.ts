import { ethers } from 'hardhat'
import chai from 'chai'
import { solidity } from 'ethereum-waffle'

chai.use(solidity)
const { expect } = chai
let blocker

describe('Blocker',  () => {

  before(async () => {
    const Blocker = await ethers.getContractFactory('Blocker')
    blocker = await Blocker.deploy()
    await blocker.deployed()
  })

  it('should return the number of block 2 and gas 5441520092711294103', async () => {
    const setDayDataTx = await blocker.setDayData(1636243200, 3, '5441520092711294103')
    await setDayDataTx.wait()
    const block = await blocker.getDayData(1636243200)

    expect(block[0].toString()).to.be.equal('3')
    expect(block[1].toString()).to.be.equal('5441520092711294103')
  })

  it('should return "Not beginning of the day"', async () => {
    await expect(blocker.setDayData(1, 2, 3)).to.be.revertedWith('Not beginning of the day')
  })
})