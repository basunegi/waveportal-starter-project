async function main() {
	const waveContractFactory = await hre.ethers.getContractFactory("WavePortal")
	const waveContract = await waveContractFactory.deploy({
		value: hre.ethers.utils.parseEther("0.1"),
	})
	await waveContract.deployed()

	console.log("Contract addy: ", waveContract.address)

	let contractBalance = await hre.ethers.provider.getBalance(waveContract.address)
	console.log("Contract Balance : ", hre.ethers.utils.formatEther(contractBalance))

	let waveTxn1 = await waveContract.wave("First wave")
	await waveTxn1.wait()

	let waveTxn2 = await waveContract.wave("Second wave")
	await waveTxn2.wait()

	contractBalance = await hre.ethers.provider.getBalance(waveContract.address)
	console.log("Contract Balance : ", hre.ethers.utils.formatEther(contractBalance))

	let allWaves = await waveContract.getAllWaves()
	console.log(allWaves)
}

async function runMain () {
	try {
		await main()
		process.exit(0) //exit node process without error
	} catch(error) {
		console.log(error)
		process.exit(1) //exit node process while indicating 'Uncaught Fatal Exception' error
	}
	// Read more about Node exit ('process.exit(num)') status codes here: https://stackoverflow.com/a/47163396/7974948
}

runMain()
