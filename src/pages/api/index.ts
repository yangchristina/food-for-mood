import type { NextApiRequest, NextApiResponse } from 'next'
import { createFood } from 'src/graph/neo4j';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {
        switch (req.method) {
            case 'GET': {
                const {} = req.body
                break;
            }
            case 'POST': {
                const food = req.body
                console.log('in post')
                await createFood(food)
                res.status(200).end("Sucessfully added food")
                break;
            }
            case 'PATCH': {
                
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