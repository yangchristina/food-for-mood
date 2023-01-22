import React, { useEffect, useState } from 'react'

const Data = () => {
    const [data, setData] = useState<any>(null)
    useEffect(() => {
        async function get() {
            const item = await fetch("https://www.foodiesfeed.com/", {
                "headers": {
                    'Access-Control-Allow-Origin': '*',
                  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                  "accept-language": "en-US,en;q=0.9",
                  "cache-control": "max-age=0",
                  "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": "\"macOS\"",
                  "sec-fetch-dest": "document",
                  "sec-fetch-mode": "navigate",
                  "sec-fetch-site": "same-origin",
                  "sec-fetch-user": "?1",
                  "upgrade-insecure-requests": "1",
                  "cookie": "_ga=GA1.1.268853256.1674377367; _ga_JHL7TTP9TD=GS1.1.1674377366.1.1.1674379138.0.0.0",
                  "Referer": "https://www.foodiesfeed.com/privacy-policy/",
                //   "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
              });
              console.log(item)
              console.log(item.json)
              console.log(item.body)
        }
        get()
    
    }, [])
    
  return (
    <div>Data</div>
  )
}

export default Data