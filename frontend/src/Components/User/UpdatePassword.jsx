import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from "react-router-dom";
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { getToken, getUser, firebaseUpdatePassword, firebaseSignIn } from '../../Utils/helpers'
import { Box, Paper, TextField, Button, Typography, IconButton, InputAdornment, Divider } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Loader from '../Layout/Loader';




const UpdatePassword = () => {
   
    const [oldPassword, setOldPassword] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isUpdated, setIsUpdated] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    let navigate = useNavigate();
    
    const updatePassword = async (oldPwd, newPwd) => {
        // Validate passwords match
        if (newPwd !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!newPwd || newPwd.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true)
        setError('')
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                     'Authorization': `Bearer ${getToken()}`

                }
            }

            // Update backend password first
            const {data } = await axios.put(`${import.meta.env.VITE_API}/password/update`, {
                oldPassword: oldPwd,
                password: newPwd
            }, config)
            
            if (data.success) {
                // Try to update Firebase password if user is authenticated with Firebase
                const user = getUser();
                
                try {
                    // Check if user has Firebase account (has firebaseUid) or is currently signed in
                    // First, try to update if already signed in to Firebase
                    await firebaseUpdatePassword(newPwd);
                    console.log('Firebase password updated successfully');
                } catch (firebaseError) {
                    // If not signed in to Firebase, try to sign in with old password first
                    if (firebaseError.message === 'No user is currently signed in' && user?.email) {
                        try {
                            // Sign in with old password to authenticate, then update
                            await firebaseSignIn(user.email, oldPwd);
                            // Now update password
                            await firebaseUpdatePassword(newPwd);
                            console.log('Firebase password updated after sign-in');
                        } catch (signInError) {
                            // If sign-in fails, user might not have Firebase account or password doesn't match
                            // This is okay - backend password was updated successfully
                            console.warn('Could not update Firebase password:', signInError.code || signInError.message);
                            // Still proceed - backend password was updated
                        }
                    } else {
                        console.warn('Firebase password update failed:', firebaseError.message);
                        // Still proceed - backend password was updated
                    }
                }
                
                setIsUpdated(data.success)
                setLoading(false)
                toast.success('Password updated successfully', {
                    position: 'bottom-right' });
                navigate('/me')
            }

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update password')
            setLoading(false)
        }
    }

    useEffect(() => {

        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
        }


    }, [error, ])

   

    const submitHandler = (e) => {
        e.preventDefault();
        updatePassword(oldPassword, password)
    }

    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title={'Change Password'} />
                    <Box className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-50 via-rose-50 to-indigo-50 dark:from-base-dark dark:via-base-soft dark:to-base-soft">
                        <Paper
                            elevation={6}
                            className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-base-soft/90 border border-purple-200/60 dark:border-purple-500/30 p-8"
                        >
                            <Typography
                                variant="h4"
                                component="h1"
                                className="font-bold text-gray-900 dark:text-ink mb-2 text-center"
                            >
                                🔐 Update Password
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-center text-gray-600 dark:text-ink-muted mb-6"
                            >
                                Enter your current password and choose a new one
                            </Typography>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={submitHandler} className="space-y-5">
                                <TextField
                                    id="old_password_field"
                                    label="Current Password"
                                    type={showOldPassword ? 'text' : 'password'}
                                    fullWidth
                                    variant="outlined"
                                    size="medium"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowOldPassword(prev => !prev)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    id="new_password_field"
                                    label="New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    variant="outlined"
                                    size="medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    helperText="Must be at least 6 characters"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(prev => !prev)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    id="confirm_password_field"
                                    label="Confirm New Password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    fullWidth
                                    variant="outlined"
                                    size="medium"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    error={confirmPassword !== '' && password !== confirmPassword}
                                    helperText={confirmPassword !== '' && password !== confirmPassword ? 'Passwords do not match' : ''}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <Divider className="my-2" />

                                <Button
                                    id="update_password_button"
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        borderRadius: '999px',
                                        py: 1.5,
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
                                    {loading ? 'Updating Password...' : 'Update Password'}
                                </Button>

                                <div className="text-center mt-4">
                                    <Link
                                        to="/me"
                                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                                    >
                                        ← Back to Profile
                                    </Link>
                                </div>
                            </form>
                        </Paper>
                    </Box>
                </>
            )}
        </>
    )
}

export default UpdatePassword