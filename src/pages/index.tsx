import Head from 'next/head'
// import Image from 'next/image'
import Image from 'next/legacy/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>FOOD 4 MOOD</title>
        <meta name="description" content="FOOD 4 MOOD is a food recommendation service" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.header}>
          <p>Welcome to FOOD 4 MOOD!</p>
        </div>
        <div className={styles.description}>
          <p>To get started, select the image that you think looks the most appetizing!</p>
        </div>

        <div className={styles.quiz}>
          <Image src={'/images/img1.jpg'} width={'200'} height={'300'}></Image>
         
        </div>
      </main>
    </>
  )
}
