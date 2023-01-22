import { Food } from '@/types';
import neo4j from "neo4j-driver"
import { chunk, shuffle } from 'lodash'
import { v4 as uuidv4 } from 'uuid';

const uri = process.env.DB_URI as string;
const user = process.env.DB_USER as string;
const password = process.env.DB_PASSWORD as string;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session({ database: 'neo4j' })

// To learn more about the driver: https://neo4j.com/docs/javascript-manual/current/client-applications/#js-driver-driver-object

// try {
//     const food1Id = 'Alice';
//     const food2Id = 'David';

//     await createFriendship(driver, food1Id, food2Id);

//     await findFood(driver, food1Id);
//     await findFood(driver, food2Id);
// } catch (error) {P
//     console.error(`Something went wrong: ${error}`);
// } finally {
//     // Don't forget to close the driver connection when you're finished with it.
//     await driver.close();
// }

export async function createFood(item: Food) {
    const session = driver.session({ database: 'neo4j' })

    try {
        const createQuery = `CREATE (n:Food $props) RETURN n`
        const result = await session.run(
            createQuery,
            { props: {...item, id: uuidv4()} }
        )

        const singleRecord = result.records[0]
        const node = singleRecord.get(0)

    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
}

async function connectFoods(goodFoodIds: string[], badFoodIds: string[]) {
    const goodResults = goodFoodIds.flatMap(
        (v, i) => goodFoodIds.slice(i + 1).map(w => [v, w])
    );
    const badResults = badFoodIds.flatMap(
        (v, i) => badFoodIds.slice(i + 1).map(w => [v, w])
    );
    console.log('good')
    const goodPromises = goodResults.map(pair => {
        console.log(pair[0], pair[1], 0.8)
        // return createRelationship(pair[0], pair[1], 0.8)
    })
    console.log('bad')
    const badPromises = badResults.map(pair => {
        console.log(pair[0], pair[1], 0.05)
        // return createRelationship(pair[0], pair[1], 0.05)
    })

    // await Promise.all([...goodPromises, ...badPromises])
}

export async function createRanking(foodIds: string[]) {
    const siteMatches = foodIds.map((id, i)=>{
        return `(food${i}:Food {id: '${id}'})`
    }).join(', ')
    const nodeNums = foodIds.map((id, i)=>{
        return `food${i}`
    }).join(', ')
    
    const query = `MATCH ${siteMatches}
                    CALL gds.eigenvector.stream('foodRanks', {
                    maxIterations: 20,
                    relationshipWeightProperty: 'weight',
                    sourceNodes: [${nodeNums}]
                    })
                    YIELD nodeId, score
                    RETURN gds.util.asNode(nodeId).restaurantName AS restaurantName, score
                    ORDER BY score DESC, restaurantName ASC`;
    const result = await session.run(query)
    console.log(result)
    return result
}

export async function getResults(goodFoodIds: string[], badFoodIds: string[]) {
    await connectFoods(goodFoodIds, badFoodIds)
    return createRanking(goodFoodIds)
}

async function createRelationship(food1Id: string, food2Id: string, weight: number) {
    const session = driver.session({ database: 'neo4j' })

    try {
        // To learn more about the Cypher syntax, see: https://neo4j.com/docs/cypher-manual/current/
        // The Reference Card is also a good resource for keywords: https://neo4j.com/docs/cypher-refcard/current/
        const writeQuery = `MATCH
                                (f1:Food),
                                (f2:Food)
                                WHERE f1.id = $food1Id AND f2.id = $food2Id
                                CREATE (f1)-[r:LIKES {weight: ${weight}}]-(f2)
                                RETURN f1, f2`

        // Write transactions allow the driver to handle retries and transient errors.
        const writeResult = await session.executeWrite(tx =>
            tx.run(writeQuery, { food1Id, food2Id })
        );

        // Check the write results.
        writeResult.records.forEach(record => {
            const food1Node = record.get('f1');
            const food2Node = record.get('f2');
            console.info(`Created relationship between: ${food1Node.properties.id}, ${food2Node.properties.id}`);
        });

    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        // Close down the session if you're not using it anymore.
        await session.close();
    }
}


export async function getAllFoods() {
    const session = driver.session({ database: 'neo4j' })
    let results;
    try {
        const readQuery = `MATCH (p:Food)
                            RETURN p.restaurantName as restaurantName, p.url as url, p.id as id`;

        const readResult = await session.executeRead(tx =>
            tx.run(readQuery)
        );

        results = readResult.records.map(record => {
            return {
                restaurantName: record.get('restaurantName'),
                url: record.get('url'),
                id: record.get('id'),
            }
        });
        console.log('results')
        console.log(results)
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
        const items = chunk(shuffle(results), 4)
        // @ts-expect-error
        if (items.length > 0 && items.at(-1).length < 4) items.pop()
        return items
    }
}

export async function findFood(foodId: string) {
    const session = driver.session({ database: 'neo4j' })

    try {
        const readQuery = `MATCH (p:Food)
                            WHERE p.id = $foodId
                            RETURN p.restaurantName as restaurantName`;

        const readResult = await session.executeRead(tx =>
            tx.run(readQuery, { foodId })
        );
        console.log(readResult)

        readResult.records.forEach(record => {
            console.log(record.get('restaurantName'))
        });
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
}
