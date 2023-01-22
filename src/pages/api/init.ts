import type { NextApiRequest, NextApiResponse } from 'next'
import { getResults, createFood, findFood, getAllFoods, clearDB, remakeDB, connectFoods, createRanking } from '@/graph/neo4j';

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
                console.log('in post')
                await remakeDB()
                res.status(200).end("Sucessfully added food")
                break;
            }
            case 'PATCH': {
                // testing only
                // await connectFoods([
                //     '01fad79c-65da-4ea3-b22c-318dc0eb057b',
                //     '2b84f1c0-08a5-4c96-8951-52a5589c8f27',
                //     '8365a2db-766b-4240-82b5-cfd1365b8e7c',
                // ], [
                //     '633d6952-51f2-426f-a9f6-c34988a9c6ef',
                //     '55b7d5e3-b24d-4c76-ada8-6bd13b3b23bb',
                //     '55b7d5e3-b24d-4c76-ada8-6bd13b3b23bb',
                //     '51ff6218-dcee-4997-93e2-5c36f928b3b2',
                //     'de4a4392-00a9-4a37-aee1-228019c1738b',
                //     'e3f7be9b-b95c-4ce9-9e91-474266929d16'
                // ])
                // await createRanking([
                //     '01fad79c-65da-4ea3-b22c-318dc0eb057b',
                //     '2b84f1c0-08a5-4c96-8951-52a5589c8f27',
                //     '8365a2db-766b-4240-82b5-cfd1365b8e7c',
                // ])
                res.status(200).end("Sucessfully patch")
                break;
            }
            case 'DELETE': {
                await clearDB()
                res.status(200).end("Sucessfully craeed")
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