import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { styled } from '@stitches/react';
import React, {useState, useEffect} from 'react'
import { fetcher } from '@/fetch';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay'


const slides = [{name: 'img1'}, {name: 'img2'}, {name: 'img3'}, {name: 'img4'}, {name: 'img5'}, {name: 'img6'}, {name: 'img7'}, {name: 'img8'}]

const inter = Inter({ subsets: ['latin'] })

const Images = styled('div', {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'auto auto',
  margin: '10px',
})

const ImageBanner = styled('div', {
  display: 'flex',
  margin: '10px',
  gap: '10px',
})

const Results = styled('div', {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'auto auto auto',
  margin: '10px',
})

const Button = styled("button", {
  backgroundColor: 'black',
  color: 'white',
  fontSize: '20px',
  padding: '10px 60px',
  borderRadius: '5px',
  margin: '10px 3px',
  cursor: 'pointer',
})

interface Image {
  url: string,
  id: number,
}

const dimensions = {
  width: '75vw',
  aspectRatio: '2 / 1',
}

const Embla = styled('div', {
  position: "relative",
  padding: "20px",
  // maxWidth: "670px",
  marginLeft: "auto",
  marginRight: "auto",
  ...dimensions,
})

const EmblaViewport = styled('div', {
  overflow: 'hidden',
  width: '120%',
})

const EmblaContainer = styled('div', {
  display: "flex",
  userSelect: "none",
  WebkitTouchCallout: "none",
  KhtmlUserSelect: "none",
  WebkitTapHighlightColor: "transparent",
  marginLeft: "-200px"
})

const EmblaSlide = styled('div', {
  position: "relative",
  minWidth: "23%",
  paddingLeft: "10px"
})

const EmblaSlideInner = styled('div', {
  position: 'relative',
  overflow: 'hidden',
  // height: '25rem',
  ...dimensions,
  size: '100%',
  // center: 'row',
})

const EmblaSlideImg = styled('div', {
  flex: 1,
  position: "absolute",
  display: "block",
  top: "50%",
  left: "50%",
  width: "auto",
  minHeight: "100%",
  minWidth: "100%",
  maxWidth: "none",
  transform: "translate(-50%, -50%)"
})

type Options = [Image, Image, Image, Image]

export default function Home() {
  const [viewportRef, embla] = useEmblaCarousel({ skipSnaps: false, loop: true }, [Autoplay()]);

  const [allImages, setAllImages] = useState<Options[]>(Array.from(Array(16)).map((x, i)=>{
    return Array.from(Array(4)).map((y, id)=> ({id, url: ''})) as Options}))
  const [good, setGood] = useState<Image[]>([])
  const [bad, setBad] = useState<Image[]>([])

  const [start, isStarted] = useState(false);
  const [fin, isFinished] = useState(false);

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

  useEffect(()=>{
    async function get(){
      const items = await fetcher('api', 'GET')
      console.log('items')
      console.log(items)
    }
    get()
  }, [])
  

  function showResult(){
    // Chris & Michelle code of accumulation
    isFinished(true);
  }

  const [restart, isRestart] = useState(false);
  
  return (
    <>
      <Head>
        <title>FOOD4MOOD</title>
        <meta name="description" content="FOOD4MOOD: a food recommendation program" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logomin.png" />
      </Head>
      <main className={styles.main}>
        <div className={styles.header}>
          <p>Welcome to </p>
          <Image src={'/images/logo5.png'} alt={"Logo"} width={'390'} height={'144'} style={{margin: '7px 25px',}}/>
        </div>

        {
          !start ?
          
          // Start page
          <>
            <div className={styles.description}>
              <p>
                Food4Mood is a food recommendation program that gives you types of food based on
                images you've selected. To start using the program, click start below!
              </p>
            </div>

            <Embla>
                <EmblaViewport ref={viewportRef}>
                    <EmblaContainer>
                        {slides.map((slide, index) => (
                            <EmblaSlide key={index}>
                                <EmblaSlideInner>
                                    <EmblaSlideImg>
                                        <Image
                                            src={`/images/${slide.name}.jpg`}
                                            className={styles.quizImage} 
                                            style={{cursor: 'auto',}}
                                            alt={`/${slide.name}`}
                                            width={'200'}
                                            height={'200'}
                                        />
                                    </EmblaSlideImg>
                                </EmblaSlideInner>
                            </EmblaSlide>
                        ))}
                    </EmblaContainer>
                </EmblaViewport>
            </Embla>

            <Button onClick={() => isStarted(true)}>Start</Button>
          </>
          :
          <>
          { 
            (fin || allImages.length == 0) ?
            
            // Results page - images to be determined by Chris's algorithm

            <>
              <div className={styles.header2}>
                <p>Results</p>
              </div>
              <div className={styles.description} style={{margin: '0px 0px 10px 0px',}}>
                <p>Your top result was:</p>
              </div>
              <Image src={'/images/img1.jpg'} className={styles.quizImage} alt={'Image 1'} width={'200'} height={'200'}/>
              <div className={styles.description} style={{margin: '10px 0px 0px 0px',}}>
                <p>You may also enjoy:</p>
              </div>
              <Results>
                <Image src={'/images/img3.jpg'} className={styles.quizImage} alt={'Image 3'} width={'200'} height={'200'}/>
                <Image src={'/images/img5.jpg'} className={styles.quizImage} alt={'Image 5'} width={'200'} height={'200'}/>
                <Image src={'/images/img7.jpg'} className={styles.quizImage} alt={'Image 7'} width={'200'} height={'200'}/>
              </Results>
              <Button onClick={() => isFinished(false)}>Restart</Button>
            </>
              
            :

            // Quiz page
            <>
              <div className={styles.description}>
                <p>Select the image that you think looks the most appetizing!</p>
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
              <div>
                <Button onClick={showResult}>Results</Button>
                <Button onClick={() => isFinished(false)}>Restart</Button>
              </div>
            </>
            }
          </>
          
      }
      </main>
    </>
  )
}
