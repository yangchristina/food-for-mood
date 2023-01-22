import { Food } from '@/types';
import neo4j from 'neo4j-driver';

const uri = process.env.DB_URI as string;
const user = process.env.DB_USER as string;
const password = process.env.DB_PASSWORD as string;

// To learn more about the driver: https://neo4j.com/docs/javascript-manual/current/client-applications/#js-driver-driver-object
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// try {
//     const food1Id = 'Alice';
//     const food2Id = 'David';

//     await createFriendship(driver, food1Id, food2Id);

//     await findFood(driver, food1Id);
//     await findFood(driver, food2Id);
// } catch (error) {
//     console.error(`Something went wrong: ${error}`);
// } finally {
//     // Don't forget to close the driver connection when you're finished with it.
//     await driver.close();
// }

export async function createFood(item: Food) {
    console.log('in create')
    const session = driver.session({ database: 'neo4j' });
    console.log('after session')

    try {
        const createQuery = `CREATE (n:Person $props)
                                RETURN n`
                                console.log('absout to query')
        const createResult = await session.executeWrite(tx =>
            tx.run(createQuery, {
                "props": item
            })
        );
        console.log('results out')
        createResult.records.forEach(record => {
            console.log(`Found food: ${record.get('id')}`)
        });
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
}

export async function connectFoods(...foodIds: string[]) {
    var result = foodIds.flatMap(
        (v, i) => foodIds.slice(i + 1).map(w => [v, w])
    );
    const promises = result.map(pair=>{
        return createRelationship(pair[0], pair[1])
    })
    await Promise.all(promises)
}

async function createRelationship(food1Id: string, food2Id: string) {

    // To learn more about sessions: https://neo4j.com/docs/javascript-manual/current/session-api/
    const session = driver.session({ database: 'neo4j' });

    try {
        // To learn more about the Cypher syntax, see: https://neo4j.com/docs/cypher-manual/current/
        // The Reference Card is also a good resource for keywords: https://neo4j.com/docs/cypher-refcard/current/
        const writeQuery = `MERGE (f1:Food { id: $food1Id })
                                MERGE (f2:Food { id: $food2Id })
                                MERGE (f1)-[:KNOWS]->(f2)
                                RETURN f1, f2`;

        // Write transactions allow the driver to handle retries and transient errors.
        const writeResult = await session.executeWrite(tx =>
            tx.run(writeQuery, { food1Id, food2Id })
        );

        // Check the write results.
        writeResult.records.forEach(record => {
            const food1Node = record.get('f1');
            const food2Node = record.get('f2');
            console.info(`Created friendship between: ${food1Node.properties.id}, ${food2Node.properties.id}`);
        });

    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        // Close down the session if you're not using it anymore.
        await session.close();
    }
}

export async function findFood(foodId: string) {

    const session = driver.session({ database: 'neo4j' });

    try {
        const readQuery = `MATCH (p:Food)
                            WHERE p.id = $foodId
                            RETURN p.id AS id`;

        const readResult = await session.executeRead(tx =>
            tx.run(readQuery, { foodId })
        );

        readResult.records.forEach(record => {
            console.log(`Found food: ${record.get('id')}`)
        });
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
}
