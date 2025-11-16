import React, { useState, useEffect } from 'react'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import Swal from 'sweetalert2'
import { getToken, errMsg } from '../../Utils/helpers'
import axios from 'axios'
import { DataGrid } from '@mui/x-data-grid'

const ProductReviews = () => {
    const [listReviews, setListReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [isDeleted, setIsDeleted] = useState(false)

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        }
    }

    const fetchAllReviews = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config)

            const flattened = []

            data.products?.forEach(product => {
                (product.reviews || []).forEach(review => {
                    flattened.push({
                        id: review._id,
                        comment: review.comment,
                        rating: review.rating,
                        reviewer: review.name || review.user,
                        product: product.name,
                        productId: product._id,
                    })
                })
            })

            setListReviews(flattened)
        } catch (error) {
            setListReviews([])
            setError(error.response?.data?.message || 'Failed to load reviews')
        } finally {
            setLoading(false)
        }
    }

    const deleteReview = async (reviewId, productId) => {
        try {
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/reviews?reviewId=${reviewId}&productId=${productId}`, config)

            if (data.success) {
                setListReviews(prev => prev.filter(review => !(review.id === reviewId && review.productId === productId)))
                setIsDeleted(true)
            }
        } catch (error) {
            setDeleteError(error.response?.data?.message || 'Failed to delete review');
        }
    }

    const deleteReviewHandler = (row) => {
        Swal.fire({
            title: 'Delete Review',
            icon: 'info',
            text: 'Do you want to delete this review',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteReview(row.id, row.productId)
            }
        })
    }

    useEffect(() => {
        fetchAllReviews()
    }, [])

    useEffect(() => {
        if (error) {
            errMsg(error)
            setError('')
        }
    }, [error])

    useEffect(() => {
        if (deleteError) {
            errMsg(deleteError)
            setDeleteError('')
        }
    }, [deleteError])

    useEffect(() => {
        if (isDeleted) {
            errMsg('Review deleted successfully')
            setIsDeleted(false)
        }
    }, [isDeleted])

    const columns = [
        {
            field: 'id',
            headerName: 'Review ID',
            flex: 1.2,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'product',
            headerName: 'Product',
            flex: 1.2,
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 110,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'comment',
            headerName: 'Comment',
            flex: 1.5,
        },
        {
            field: 'reviewer',
            headerName: 'Reviewer',
            width: 160,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <button
                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                    onClick={() => deleteReviewHandler(params.row)}
                >
                    <i className="fa fa-trash" />
                </button>
            )
        }
    ];

    const rows = listReviews;

    return (
        <>
            <MetaData title={'Product Reviews'} />

            <div className="min-h-screen bg-white dark:bg-base-dark flex">
                <div className="w-64 flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-1 p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-ink mb-1">All Product Reviews</h1>
                                <p className="text-sm text-gray-600 dark:text-ink-muted">
                                    View and manage every review across your store. Each row shows the product and who reviewed it.
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader />
                            </div>
                        ) : listReviews && listReviews.length > 0 ? (
                            <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-500/30 p-4 sm:p-6">
                                <div className="mb-3 text-xs text-gray-600 dark:text-ink-muted">
                                    Showing {rows.length} review(s) in total.
                                </div>
                                <div style={{ height: 520, width: '100%' }}>
                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        pageSize={5}
                                        rowsPerPageOptions={[5, 10, 25]}
                                        disableSelectionOnClick
                                        getRowId={(row) => row.id}
                                        sx={{
                                            border: 'none',
                                            '& .MuiDataGrid-main': {
                                                color: 'inherit',
                                            },
                                            '& .MuiDataGrid-virtualScroller': {
                                                backgroundColor: 'transparent',
                                            },
                                            '& .MuiDataGrid-cell': {
                                                borderBottom: '1px solid rgba(147, 51, 234, 0.08)',
                                            },
                                            '& .MuiDataGrid-columnHeaders': {
                                                backgroundColor: 'rgba(147, 51, 234, 0.06)',
                                                borderBottom: '2px solid rgba(147, 51, 234, 0.18)',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                            },
                                            '& .MuiDataGrid-row:hover': {
                                                backgroundColor: 'rgba(147, 51, 234, 0.03)',
                                            },
                                            '& .MuiDataGrid-footerContainer': {
                                                borderTop: '2px solid rgba(147, 51, 234, 0.18)',
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="mt-5 text-center text-sm text-gray-600 dark:text-ink-muted">
                                No reviews found.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductReviews