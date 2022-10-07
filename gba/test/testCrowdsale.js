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
});