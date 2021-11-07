// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";

contract Blocker {
    
    address public owner;

    constructor() {
        owner = msg.sender;
    }
        
    struct DayData {
        uint numOfBlocks;
        uint gasUsed;
    }
    
    event DayAdded(uint indexed _day, DayData dayData);
    
    mapping (uint => DayData) dayMapping;

    function setDayData(uint _day, uint _numOfBlocks, uint _gasUsed) public {
        require(isTimestampBeginningOfTheDay(_day), "Not beginning of the day");
        require(msg.sender == owner, "This can only be called by the contract owner!");
        console.log("setDayData", _day, _numOfBlocks, _gasUsed);

        dayMapping[_day].numOfBlocks = _numOfBlocks;
        dayMapping[_day].gasUsed = _gasUsed;
        
        emit DayAdded(_day, DayData(_numOfBlocks, _gasUsed));
    }
    
    function getDayData(uint _day) view public returns (uint, uint) {
        return (dayMapping[_day].numOfBlocks, dayMapping[_day].gasUsed);
    }
    
    function isTimestampBeginningOfTheDay(uint _day) private pure returns(bool) {
        if(_day % (24 * 60 * 60) == 0)
            return true;
        else 
            return false;
    }

}