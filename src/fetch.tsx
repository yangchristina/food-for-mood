export function paramsToQueryString(params = {}) {
    return Object.entries(params)
        .map(param => `${param[0]}=${param[1]}`)
        .join("&")
}

export async function fetcher(url: string, method: string, body = {}, queryParams = {}) {
    const res = await fetch(`${url}?${paramsToQueryString(queryParams)}`, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(method !== 'GET' && {body: JSON.stringify(body)})
    })
    return await res.json()
}