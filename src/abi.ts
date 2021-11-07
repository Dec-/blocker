const abi = `[
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_day",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "numOfBlocks",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "gasUsed",
              "type": "uint256"
            }
          ],
          "indexed": false,
          "internalType": "struct Blocker.DayData",
          "name": "dayData",
          "type": "tuple"
        }
      ],
      "name": "DayAdded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_day",
          "type": "uint256"
        }
      ],
      "name": "getDayData",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_day",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_numOfBlocks",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_gasUsed",
          "type": "uint256"
        }
      ],
      "name": "setDayData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]`

export { abi }