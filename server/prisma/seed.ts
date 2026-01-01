import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const main = async () => {
	const example = await prisma.movie.upsert({
		where: { tmdbId: 9999999 },
		update: { title: 'Seeded Example Movie' },
		create: { tmdbId: 9999999, title: 'Seeded Example Movie' },
	})

	await prisma.historicalSnapshot.create({
		data: {
			movieId: example.id,
			hypeScore: 42,
			popularity: 50,
		},
	})
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
