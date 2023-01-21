import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { styled } from '@stitches/react';
import {useState, useEffect} from 'react'
const inter = Inter({ subsets: ['latin'] })

const Images = styled('div', {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'auto auto',
  margin: '10px',
})

interface Image {
  url: string,
  id: number,
}

type Options = [Image, Image, Image, Image]

export default function Home() {
  const [allImages, setAllImages] = useState<Options[]>(Array.from(Array(16)).map((x, i)=>{
    return Array.from(Array(4)).map((y, id)=> ({id, url: ''})) as Options}))
  const [good, setGood] = useState<Image[]>([])
  const [bad, setBad] = useState<Image[]>([])

  function getNextImages1(){console.log("hi")}

  function handleImageClick(e: any) {
    const id = parseInt(e?.target?.id)
    const images = allImages[0]
    setGood(x=>[...x, ...images.filter(x=>x.id===id)])
    setBad(x=>[...x, ...images.filter(x=>x.id!==id)])
    setAllImages(x=>{
      x.shift()
      return [...x]
    })
  }

  useEffect(() => {
    console.log('good')
    console.log(good)
    console.log('bad')
    console.log(bad)
  }, [allImages])
  
  
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
          <Images>
            {
              allImages[0].map((img, i)=>{
                return <Image id={img.id.toString()} onClick={handleImageClick} className={styles.quizImage} src={`/images/img${i+1}.jpg`} alt={'Image ' + (i+1)} width={'200'} height={'200'}/>
              })
            }
          </Images>
        
       
        
        </div>
       
    </>
  )
}
