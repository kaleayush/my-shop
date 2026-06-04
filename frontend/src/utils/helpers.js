export const parseJwtExp = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload).exp ?? null
  } catch {
    return null
  }
}

export const isTokenExpired = (token) => {
  if (!token) return true
  const exp = parseJwtExp(token)
  return exp ? exp * 1000 < Date.now() : true
}

export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export const toSelectOptions = (items, labelKey = 'name', valueKey = 'id') =>
  (items ?? []).map((item) => ({ label: item[labelKey], value: item[valueKey] }))

export const emptyToNull = (val) => (val === '' ? null : val)
