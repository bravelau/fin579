const {expect} = require ("chai");
const {ethers} = require ("hardhat");

describe ("Test Crowdsale", () => {
    let accounts;
    let crowdSale;
    let wndr;

    beforeEach (async () =>{
        accounts = await ethers.getSigners();

        let factory = await ethers.getContractFactory("AssignmentERC20");
        wndr = await factory.deploy (
            "Assignment ERC20 token",
            "WNDR", 
            accounts[0].address);

        factory = await ethers.getContractFactory("Crowdsale");
        crowdSale = await factory.deploy (wndr.address, 100, accounts[0].address);

        wndr.transferOwnership(crowdSale.address);
    });

    it ("Should sell 100 unit of WNDR", async ()=>{
        const before = await wndr.balanceOf(accounts[1].address);
        const response = await crowdSale     
            .connect(accounts[1])
            .buy(100, {value:100000});

        await response.wait();

        const after = await wndr.balanceOf(accounts[1].address);
        expect(before.add(100).toNumber()).equals(after.toNumber());
      });

    it ("Transfer Ether out", async ()=>{

        // buy some WNDRs so that the crowdSale contract has some eth
        let response = await crowdSale     
            .connect(accounts[1])
            .buy(100, {value:300000000000000}); // need to pass in enough ethers
        await response.wait();
        
        const ethInCSBefore = await crowdSale.getEthBalance();
        console.log("Ether in Crowdsale before", ethInCSBefore.toNumber());

        const ethInAccBefore = await accounts[0].getBalance();
        console.log("Ethers in accounts[0] before", ethInAccBefore);

        // call transfer function to get Ether back
        const ethWithDrawn = ethInCSBefore.toNumber();
        response = await crowdSale.transferEthOut (accounts[0].address, ethWithDrawn);

        const ethInCSAfter = await crowdSale.getEthBalance();
        console.log("Ether in Crowdsale after", ethInCSAfter.toNumber());

        const ethInAccAfter = await accounts[0].getBalance();
        console.log("Ethers in accounts[0] after", ethInAccAfter);

        expect(ethInCSBefore.sub(ethWithDrawn).toNumber()).equals(ethInCSAfter.toNumber());
    });

    it ("Adjust unit price", async ()=>{

        const unitPriceBefore = await crowdSale.getUnitPrice();
        console.log("unit price before", unitPriceBefore.toNumber());

        const unitPriceToSet = 1000;
        let response = await crowdSale.adjustUnitPrice(unitPriceToSet);     
   
        await response.wait();
        
        const unitPriceAfter = await crowdSale.getUnitPrice();
        console.log("unit price after", unitPriceAfter.toNumber());

        expect(unitPriceAfter.toNumber()).equals(unitPriceToSet);
   });


});