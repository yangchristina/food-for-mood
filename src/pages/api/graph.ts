import type { NextApiRequest, NextApiResponse } from 'next'
import { getResults, createFood, findFood, getAllFoods, createRanking } from '@/graph/neo4j';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {
        switch (req.method) {
            case 'GET': {
                const { foodIds } = req.body

                const items = await createRanking(foodIds)
                console.log(items)
                res.status(200).json(items)
                break;
            }
            default:
                res.status(405).end('Method Not Allowed')
                break;
        }
    } catch (error) {
        console.error(error)
        res.status(400).end(error)
    }
}