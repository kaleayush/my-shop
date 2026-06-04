import { useState, useMemo } from 'react'

export const usePagination = (data = [], defaultPageSize = 10) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalPages = Math.ceil(data.length / pageSize)

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  const handlePageChange = (newPage) => setPage(newPage)
  const handlePageSizeChange = (newSize) => { setPageSize(newSize); setPage(1) }

  return {
    page,
    pageSize,
    totalPages,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  }
}
