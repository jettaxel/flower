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
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('card')
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
        
        // Set payment info based on payment method
        if (paymentMethod === 'cod') {
            order.paymentInfo = {
                id: 'cod',
                status: 'pending'
            }
            order.paymentMethod = 'cod';
        } else {
            order.paymentInfo = {
                id: 'pi_1DpdYh2eZvKYlo2CYIynhU32',
                status: 'succeeded'
            }
            order.paymentMethod = 'card';
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
                        Choose your payment method
                    </Typography>

                    <form onSubmit={submitHandler} className="space-y-5">
                        {/* Payment Method Selection */}
                        <div className="space-y-3">
                            <Typography variant="subtitle2" className="text-gray-700 dark:text-ink font-medium">
                                Payment Method
                            </Typography>
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'card'
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                            className="w-4 h-4 text-purple-600"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 dark:text-ink">Credit/Debit Card</div>
                                            <div className="text-sm text-gray-600 dark:text-ink-muted">Pay securely with your card</div>
                                        </div>
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'cod'
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                            className="w-4 h-4 text-purple-600"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 dark:text-ink">Cash on Delivery (COD)</div>
                                            <div className="text-sm text-gray-600 dark:text-ink-muted">Pay when you receive your order</div>
                                        </div>
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <Divider className="my-2" />

                        {/* Card Payment Fields - Only show if card is selected */}
                        {paymentMethod === 'card' && (
                            <>
                                <TextField
                                    id="card_num_field"
                                    label="Card Number"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    size="medium"
                                    placeholder="1234 5678 9012 3456"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <TextField
                                        id="card_exp_field"
                                        label="Card Expiry"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        size="medium"
                                        placeholder="MM/YY"
                                    />

                                    <TextField
                                        id="card_cvc_field"
                                        label="Card CVC"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        size="medium"
                                        placeholder="123"
                                    />
                                </div>
                                <Divider className="my-2" />
                            </>
                        )}

                        {paymentMethod === 'cod' && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    💡 <strong>Cash on Delivery:</strong> You will pay the total amount when you receive your order. No payment is required now.
                                </p>
                            </div>
                        )}

                        <Button
                            id="pay_btn"
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
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
                                },
                                '&:disabled': {
                                    opacity: 0.6
                                }
                            }}
                        >
                            {loading 
                                ? 'Processing...' 
                                : paymentMethod === 'cod' 
                                    ? `Place Order (COD) - ₱${orderInfo && orderInfo.totalPrice}` 
                                    : `Pay - ₱${orderInfo && orderInfo.totalPrice}`
                            }
                        </Button>
                    </form>
                </Paper>
            </Box>

        </>
    )
}

export default Payment