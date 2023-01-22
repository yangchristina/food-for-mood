import type { NextApiRequest, NextApiResponse } from 'next'
import { getResults, createFood, findFood, getAllFoods } from '@/graph/neo4j';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {
        switch (req.method) {
            case 'GET': {
                const { id } = req.query
                if (id) {
                    if (typeof id !== 'string') throw new Error('Invalid id')
                    const item = await findFood(id)
                    res.status(200).json(item)
                } else {
                    const items = await getAllFoods()
                    console.log(items)
                    res.status(200).json(items)
                }
                break;
            }
            case 'POST': {
                // adds a new food item to graph
                const food = req.body
                console.log('in post')
                await createFood(food)
                res.status(200).end("Sucessfully added food")
                break;
            }
            case 'PATCH': {
                const { goodFoodIds, badFoodIds } = req.body
                await getResults(goodFoodIds, badFoodIds)
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