import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken } from '../../Utils/helpers';
import { Box, Paper, TextField, Button, Typography, Divider } from '@mui/material';



const Payment = ({cartItems, shippingInfo, clearCart}) => {
    const [loading, setLoading] = useState(true)
    let navigate = useNavigate();
    useEffect(() => {
    }, [])

    const order = {
        orderItems: cartItems,
        shippingInfo
    }

    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo'));
    if (orderInfo) {
        order.itemsPrice = orderInfo.itemsPrice
        order.shippingPrice = orderInfo.shippingPrice
        order.taxPrice = orderInfo.taxPrice
        order.totalPrice = orderInfo.totalPrice
    }

    const createOrder = async (order) => {
        console.log(order)
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
            const { data } = await axios.post(`${import.meta.env.VITE_API}/order/new`, order, config)
            // setIsUpdated(data.success)
            setLoading(false)
            
            // Show success message with email confirmation
            const successMessage = data.emailSent 
                ? 'Order created successfully! Confirmation email with PDF receipt sent.'
                : 'Order created successfully! (Email notification failed)';
                
            toast.success(successMessage, {
                position: 'bottom-right',
                autoClose: 5000
            });

            // Clear cart after successful order creation
            if (typeof clearCart === 'function') {
                clearCart();
            }
            
            // Clear orderInfo from sessionStorage
            sessionStorage.removeItem('orderInfo')
            
            // Navigate to success page after cart is cleared
            navigate('/success')
    
        } catch (error) {
            setLoading(false)
            document.querySelector('#pay_btn').disabled = false;
            toast.error(error.response?.data?.message || 'Failed to create order', {
                position: 'bottom-right'
            });
        }
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const payBtn = document.querySelector('#pay_btn');
        if (payBtn) {
            payBtn.disabled = true;
        }
        setLoading(true);
        order.paymentInfo = {
            id: 'pi_1DpdYh2eZvKYlo2CYIynhU32',
            status: 'succeeded'
        }
        // Wait for order creation to complete before navigating
        await createOrder(order)
      }

    return (
        <>
            <MetaData title={'Payment'} />
            <CheckoutSteps shipping confirmOrder payment />
            <Box className="min-h-[70vh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-purple-50 via-rose-50 to-indigo-50 dark:from-base-dark dark:via-base-soft dark:to-base-soft">
                <Paper
                    elevation={6}
                    className="w-full max-w-lg rounded-2xl bg-white/90 dark:bg-base-soft/90 border border-purple-200/60 dark:border-purple-500/30 p-8"
                >
                    <Typography
                        variant="h5"
                        component="h1"
                        className="font-semibold text-gray-900 dark:text-ink tracking-wide mb-1 text-center"
                    >
                        Payment
                    </Typography>
                    <Typography
                        variant="body2"
                        className="text-center text-gray-600 dark:text-ink-muted mb-6"
                    >
                        Securely confirm your order payment details
                    </Typography>

                    <form onSubmit={submitHandler} className="space-y-5">
                        <TextField
                            id="card_num_field"
                            label="Card Number"
                            type="text"
                            fullWidth
                            variant="outlined"
                            size="medium"
                        />

                        <TextField
                            id="card_exp_field"
                            label="Card Expiry"
                            type="text"
                            fullWidth
                            variant="outlined"
                            size="medium"
                        />

                        <TextField
                            id="card_cvc_field"
                            label="Card CVC"
                            type="text"
                            fullWidth
                            variant="outlined"
                            size="medium"
                        />

                        <Divider className="my-2" />

                        <Button
                            id="pay_btn"
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                borderRadius: '999px',
                                py: 1.4,
                                textTransform: 'none',
                                fontWeight: 600,
                                backgroundImage: 'linear-gradient(to right, #a855f7, #6366f1)',
                                boxShadow: '0 10px 25px rgba(88, 28, 135, 0.35)',
                                '&:hover': {
                                    backgroundImage: 'linear-gradient(to right, #9333ea, #4f46e5)',
                                    boxShadow: '0 12px 30px rgba(76, 29, 149, 0.5)'
                                }
                            }}
                        >
                            Pay {` - ₱${orderInfo && orderInfo.totalPrice}`}
                        </Button>
                    </form>
                </Paper>
            </Box>

        </>
    )
}

export default Payment