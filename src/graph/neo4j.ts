import { Food } from '@/types';
import neo4j from "neo4j-driver"
import { chunk, shuffle } from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import data from '../data.json'

const uri = process.env.DB_URI as string;
const user = process.env.DB_USER as string;
const password = process.env.DB_PASSWORD as string;

// const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

const driver = neo4j.driver('neo4j://34.205.81.215:7687',
    neo4j.auth.basic('neo4j', 'keys-workman-sense'),
    {/* encrypted: 'ENCRYPTION_OFF' */ });

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

export async function remakeDB() {
    await clearDB()
    const items = [...data]

    // `CALL gds.graph.project(
    //     'graph4',                    
    //     'Food',                             
    //     {LIKES: {orientation: 'UNDIRECTED', properties: "weight" }}  
    //   )
    //   YIELD
    //     graphName AS graph,
    //     relationshipProjection,
    //     nodeCount AS nodes,
    //     relationshipCount AS rels`

    const session = driver.session({ database: 'neo4j' })
    const params: any = {}

    const createString = items.map((url, i) => {
        params['props' + i] = { url, id: uuidv4() }
        return `(f${i}:Food $props${i})`
    }).join(', ')

    try {
        const createQuery = `CREATE ${createString}`

        await session.run(
            createQuery,
            params
        )
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
}

export async function clearDB() {
    const session = driver.session({ database: 'neo4j' })

    try {
        const query = `match (a) -[r] -> () delete a, r`
        await session.run(query)
        const query2 = `match (a) delete a`
        await session.run(query2)
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
}

export async function createFood(item: Food) {
    const session = driver.session({ database: 'neo4j' })

    try {
        const createQuery = `CREATE (n:Food $props) RETURN n`
        const result = await session.run(
            createQuery,
            { props: { ...item, id: uuidv4() } }
        )

        const singleRecord = result.records[0]
        const node = singleRecord.get(0)

    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
}

export async function connectFoods(goodFoodIds: string[], badFoodIds: string[]) {
    const session = driver.session({ database: 'neo4j' })
    const goodResults = goodFoodIds.flatMap(
        (v, i) => goodFoodIds.slice(i + 1).map(w => [v, w])
    );
    const badResults = badFoodIds.flatMap(
        (v, i) => badFoodIds.slice(i + 1).map(w => [v, w])
    );

    const goodMatch = goodResults.map((pair, i) => {
        return `(gf${i}f1:Food {id: '${pair[0]}'}), (gf${i}f2:Food {id: '${pair[1]}'})`
    })

    const badMatch = badResults.map((pair, i) => {
        return `(bf${i}f1:Food {id: '${pair[0]}'}), (bf${i}f2:Food {id: '${pair[1]}'})`
    })

    const match = [...goodMatch, ...badMatch].join(' ,')

    const goodCreates = goodResults.map((pair, i) => {
        return `(gf${i}f1)-[gr${i}:LIKES {weight: ${1}}]->(gf${i}f2)`
        // return `(f${i}f1), (f${i}f2:Food {id: '${pair[1]}'})`
        // return await createRelationship(pair[0], pair[1], 0.8)
    })
    // console.log(goodPromises)
    // console.log('bad')
    const badCreates = badResults.map((pair, i) => {
        // console.log(pair[0], pair[1], 0.05)
        return `(bf${i}f1)-[br${i}:LIKES {weight: ${0.1}}]->(bf${i}f2)`
        // return createRelationship(pair[0], pair[1], 0.05)
    })
    const create = [...goodCreates, ...badCreates].join(', ')

    try {
        // console.log('relat')
        // To learn more about the Cypher syntax, see: https://neo4j.com/docs/cypher-manual/current/
        // The Reference Card is also a good resource for keywords: https://neo4j.com/docs/cypher-refcard/current/
        const writeQuery = `MATCH ${match} CREATE ${create}`

        // Write transactions allow the driver to handle retries and transient errors.
        const writeResult = await session.executeWrite(tx =>
            tx.run(writeQuery)
        );

        // console.log(writeResult)

        // Check the write results.
        // writeResult.records.forEach(record => {
        //     const food1Node = record.get('f1');
        //     const food2Node = record.get('f2');
        //     console.info(`Created relationship between: ${food1Node.properties.id}, ${food2Node.properties.id}`);
        // });

    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        // Close down the session if you're not using it anymore.
        await session.close();
    }
}

export async function createRanking(foodIds: string[], id: string) {
    const session = driver.session({ database: 'neo4j' })
    const siteMatches = foodIds.map((id, i) => {
        return `(food${i}:Food {id: '${id}'})`
    }).join(', ')
    const nodeNums = foodIds.map((id, i) => {
        return `food${i}`
    }).join(', ')

    const query = `MATCH ${siteMatches}
                    CALL gds.pageRank.stream('foodRank${id}', {
                    maxIterations: 20,
                    relationshipWeightProperty: 'weight',
                    sourceNodes: [${nodeNums}]
                    })
                    YIELD nodeId, score
                    RETURN gds.util.asNode(nodeId).url AS url, score
                    ORDER BY score DESC, url ASC`;

    const result = await session.run(query)
    // console.log(result)
    await session.close()

    const res = result.records.map(record => {
        return { score: record.get('score'), url: record.get('url') };
        // console.info(`Created relationship between: ${food1Node.properties.id}, ${food2Node.properties.id}`);
    });
    // console.log(res[1])
    return res.slice(0, 4)
}

export async function getResults(goodFoodIds: string[], badFoodIds: string[]) {
    const id = uuidv4()

    const session = driver.session({ database: 'neo4j' })


    const query = `CALL gds.graph.project(
        'foodRank${id}',                    
        'Food',                             
        {LIKES: {orientation: 'UNDIRECTED', properties: "weight" }}  
        )
        YIELD
        graphName AS graph,
        relationshipProjection,
        nodeCount AS nodes,
        relationshipCount AS rels`


    await session.run(query)
    await session.close()
    const res = await createRanking(goodFoodIds, id)

    connectFoods(goodFoodIds, badFoodIds)
    const session2 = driver.session({ database: 'neo4j' })
    const dropQuery = `CALL gds.graph.drop('foodRank${id}') YIELD graphName`
    session2.run(dropQuery).then(()=>session2.close())
    return res
}


async function createRelationships(food1Id: string, food2Id: string, weight: number) {
    const session = driver.session({ database: 'neo4j' })

    try {
        // To learn more about the Cypher syntax, see: https://neo4j.com/docs/cypher-manual/current/
        // The Reference Card is also a good resource for keywords: https://neo4j.com/docs/cypher-refcard/current/
        const writeQuery = `MATCH (f1:Food {id: '${food1Id}'}), (f2:Food {id: '${food2Id}'})
                                CREATE (f1)-[r:LIKES {weight: ${weight}}]->(f2)
                                RETURN f1, f2`



        // Write transactions allow the driver to handle retries and transient errors.
        const writeResult = await session.executeWrite(tx =>
            tx.run(writeQuery)
        );

        // console.log(writeResult)


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

async function createRelationship(food1Id: string, food2Id: string, weight: number) {
    const session = driver.session({ database: 'neo4j' })

    try {
        console.log('relat')
        // To learn more about the Cypher syntax, see: https://neo4j.com/docs/cypher-manual/current/
        // The Reference Card is also a good resource for keywords: https://neo4j.com/docs/cypher-refcard/current/
        const writeQuery = `MATCH (f1:Food {id: '${food1Id}'}), (f2:Food {id: '${food2Id}'})
                                CREATE (f1)-[r:LIKES {weight: ${weight}}]->(f2)
                                RETURN f1, f2`



        // Write transactions allow the driver to handle retries and transient errors.
        const writeResult = await session.executeWrite(tx =>
            tx.run(writeQuery)
        );

        // console.log(writeResult)

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
                            RETURN p.url as url, p.id as id`;

        const readResult = await session.executeRead(tx =>
            tx.run(readQuery)
        );

        results = readResult.records.map(record => {
            return {
                url: record.get('url'),
                id: record.get('id'),
            }
        });

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
                            RETURN p.url as url`;

        const readResult = await session.executeRead(tx =>
            tx.run(readQuery, { foodId })
        );

    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
}
