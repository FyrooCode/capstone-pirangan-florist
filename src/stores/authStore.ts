import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Define the structure for user profiles
interface UserProfile {
    id: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    role: string;
    created_at?: string;
    updated_at?: string;
}

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(null)
    const session = ref<Session | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const shouldUseGoogle = ref(false)
    const userRole = ref<string | null>(null)
    const userProfile = ref<UserProfile | null>(null)

    // Computed properties
    const isLoggedIn = computed(() => !!user.value)
    const isAdmin = computed(() => userRole.value === 'admin')
    const isCustomer = computed(() => userRole.value === 'customer')

    // Initialize auth state with better profile handling
    const initialize = async () => {
        loading.value = true

        try {
            // Get current session
            const { data: { session: currentSession } } = await supabase.auth.getSession()
            session.value = currentSession

            if (currentSession) {
                user.value = currentSession.user
                // Ensure user profile exists and role is set
                await fetchUserProfile().then(profile => {
                    if (!profile) {
                        console.log('No profile found during initialization, creating one')
                        ensureProfile().then(createdProfile => {
                            if (createdProfile) {
                                console.log('Profile created during initialization')
                            }
                        })
                    }
                })
            }

            // Listen for auth state changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
                console.log('Auth state changed:', event)
                session.value = newSession
                user.value = newSession?.user || null

                if (newSession?.user) {
                    // Ensure user profile exists when auth state changes
                    const profile = await fetchUserProfile()
                    if (!profile && event !== 'INITIAL_SESSION') {
                        console.log('Creating profile after auth state change event:', event)
                        await ensureProfile()
                    }
                } else {
                    userProfile.value = null
                    userRole.value = null
                }
            })

            return () => subscription.unsubscribe()
        } catch (err) {
            console.error('Error initializing auth:', err)
            error.value = 'Failed to initialize authentication'
        } finally {
            loading.value = false
        }
    }

    // Fetch user profile from profiles table
    const fetchUserProfile = async () => {
        if (!user.value) return null

        try {
            console.log('Fetching user profile for:', user.value.id)
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.value.id)
                .maybeSingle()

            if (fetchError) {
                console.error('Error fetching user profile:', fetchError)
                return null
            }

            if (data) {
                userProfile.value = data as UserProfile
                userRole.value = data.role
                console.log('User profile loaded. Role:', userRole.value)
                return data
            } else {
                console.log('No profile found for user, will create one')
                return null
            }
        } catch (err) {
            console.error('Exception in fetchUserProfile:', err)
            return null
        }
    }

    // Create or update profile after successful sign in/up
    const ensureProfile = async (userData?: { firstName?: string; lastName?: string }) => {
        if (!user.value) {
            console.error('Cannot create profile: No user logged in')
            return null
        }

        console.log('Ensuring profile exists for user:', user.value.id)

        try {
            // Check if profile already exists
            const { data: existingProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.value.id)
                .maybeSingle()

            if (fetchError) {
                console.error('Error checking for existing profile:', fetchError)
            }

            const now = new Date().toISOString()

            if (existingProfile) {
                console.log('Profile exists, updating if needed:', existingProfile)
                // Profile exists, update if needed
                if (userData?.firstName || userData?.lastName) {
                    const { data, error: updateError } = await supabase
                        .from('profiles')
                        .update({
                            first_name: userData.firstName || existingProfile.first_name,
                            last_name: userData.lastName || existingProfile.last_name,
                            updated_at: now
                        })
                        .eq('user_id', user.value.id)
                        .select()
                        .single()

                    if (updateError) {
                        console.error('Error updating profile:', updateError)
                        return existingProfile // Return existing profile even if update fails
                    } else if (data) {
                        userProfile.value = data as UserProfile
                        userRole.value = data.role
                        return data
                    }
                }

                // If no update needed, just set the profile from existing data
                userProfile.value = existingProfile as UserProfile
                userRole.value = existingProfile.role
                return existingProfile
            } else {
                console.log('Creating new profile for Google user:', user.value.id)

                // Extract name from Google auth metadata if available
                let firstName = userData?.firstName || ''
                let lastName = userData?.lastName || ''

                if (!firstName && !lastName && user.value.app_metadata?.provider === 'google') {
                    // For Google Authentication, parse the name from user metadata
                    console.log('Extracting name from Google metadata:', user.value.user_metadata)
                    firstName = user.value.user_metadata?.given_name ||
                        user.value.user_metadata?.name?.split(' ')[0] || ''

                    lastName = user.value.user_metadata?.family_name ||
                        (user.value.user_metadata?.name?.split(' ').length > 1 ?
                            user.value.user_metadata?.name?.split(' ').slice(1).join(' ') : '')
                }

                // Create profile with default role (customer)
                const profileData = {
                    user_id: user.value.id,
                    first_name: firstName,
                    last_name: lastName,
                    role: 'customer', // Default role
                    created_at: now,
                    updated_at: now
                }

                console.log('Attempting to insert profile data:', JSON.stringify(profileData))

                // First attempt: Insert using standard client
                const { data: insertedProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert(profileData)
                    .select()

                if (insertError) {
                    console.error('Profile insertion failed with standard client:', insertError)

                    // Second attempt: Try with explicit session token
                    try {
                        const { data: sessionData } = await supabase.auth.getSession()
                        const authClient = supabase.auth.getUser()

                        console.log('Retrying profile creation with auth client')
                        const { data: retryData, error: retryError } = await supabase
                            .from('profiles')
                            .insert(profileData)
                            .select()

                        if (retryError) {
                            console.error('Profile creation failed on retry:', retryError)
                            // If we still can't create the profile, create a temporary client-side one
                            const tempProfile = {
                                id: 'temp-' + user.value.id,
                                user_id: user.value.id,
                                first_name: firstName,
                                last_name: lastName,
                                role: 'customer',
                                created_at: now,
                                updated_at: now
                            }
                            userProfile.value = tempProfile as UserProfile
                            userRole.value = 'customer'
                            return tempProfile
                        } else if (retryData && retryData.length > 0) {
                            userProfile.value = retryData[0] as UserProfile
                            userRole.value = retryData[0].role
                            console.log('Profile created on retry:', retryData[0])
                            return retryData[0]
                        }
                    } catch (apiError) {
                        console.error('All profile creation attempts failed:', apiError)
                    }

                    // Allow the app to continue by returning a temporary profile
                    const tempProfile = {
                        id: 'temp-' + user.value.id,
                        user_id: user.value.id,
                        first_name: firstName,
                        last_name: lastName,
                        role: 'customer',
                        created_at: now,
                        updated_at: now
                    }
                    userProfile.value = tempProfile as UserProfile
                    userRole.value = 'customer'
                    return tempProfile
                }

                // Success with first attempt
                if (insertedProfile && insertedProfile.length > 0) {
                    userProfile.value = insertedProfile[0] as UserProfile
                    userRole.value = insertedProfile[0].role
                    console.log('Profile created successfully on first attempt:', insertedProfile[0])
                    return insertedProfile[0]
                }

                return null
            }
        } catch (err) {
            console.error('Exception in ensureProfile:', err)
            return null
        }
    }

    // Check if email is already registered and what provider it uses
    const checkEmailProvider = async (email: string) => {
        loading.value = true
        error.value = null

        try {
            const { error: signInError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    // Just check if email exists, don't actually send an email
                    shouldCreateUser: false
                }
            })

            if (signInError) {
                if (signInError.message.includes('Email not confirmed')) {
                    // Email exists but is not confirmed
                    return { exists: true, provider: 'email' }
                }
                if (signInError.message.includes('Email auth provider')) {
                    // Email exists in email auth provider
                    return { exists: true, provider: 'email' }
                }
                if (signInError.message.includes('Google')) {
                    // Email exists in Google auth provider
                    return { exists: true, provider: 'google' }
                }
                throw signInError
            }

            // If we get here, email doesn't exist
            return { exists: false, provider: null }
        } catch (err: any) {
            console.error('Error checking email:', err)
            return { exists: false, provider: null }
        } finally {
            loading.value = false
        }
    }

    // Modified sign up function to handle existing accounts better and create profile
    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
        loading.value = true
        error.value = null
        shouldUseGoogle.value = false

        try {
            // Check if email already exists and with what provider
            const { exists, provider } = await checkEmailProvider(email)

            if (exists) {
                if (provider === 'google') {
                    shouldUseGoogle.value = true
                    error.value = 'Email sudah terdaftar dengan Google. Silakan login menggunakan Google.'
                    return { success: false }
                } else {
                    error.value = 'Email sudah terdaftar. Silakan login.'
                    return { success: false }
                }
            }

            // Sign up user using email/password
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`,
                    data: {
                        first_name: firstName,
                        last_name: lastName
                    }
                }
            })

            if (signUpError) {
                throw signUpError
            }

            if (data?.user) {
                // Create user profile
                await ensureProfile({
                    firstName,
                    lastName
                })

                return { success: true, user: data.user }
            } else {
                error.value = 'Gagal membuat akun'
                return { success: false }
            }
        } catch (err: any) {
            console.error('Registration error:', err)
            error.value = err.message || 'Error saat mendaftar'
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    // Modify sign in to fetch user profile
    const signIn = async (email: string, password: string) => {
        loading.value = true
        error.value = null
        shouldUseGoogle.value = false

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (signInError) {
                // Check if this is a Google account
                if (signInError.message.includes('provider') && signInError.message.includes('email')) {
                    const { provider } = await checkEmailProvider(email)

                    if (provider === 'google') {
                        shouldUseGoogle.value = true
                        error.value = 'Akun ini terdaftar dengan Google. Silakan gunakan login Google.'
                        return { success: false }
                    }
                }

                throw signInError
            }

            if (data?.user) {
                user.value = data.user
                session.value = data.session

                // Ensure profile is loaded
                await fetchUserProfile()

                return { success: true, user: data.user }
            } else {
                error.value = 'Login tidak valid'
                return { success: false }
            }
        } catch (err: any) {
            console.error('Login error:', err)
            error.value = err.message === 'Invalid login credentials'
                ? 'Email atau kata sandi tidak valid'
                : (err.message || 'Error saat login')
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    // Google sign in
    const googleSignIn = async () => {
        loading.value = true
        error.value = null
        shouldUseGoogle.value = false

        try {
            // Get the current origin for redirect
            const redirectUrl = `${window.location.origin}/auth/callback`
            console.log('Using redirect URL:', redirectUrl)

            const { data, error: signInError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            })

            if (signInError) {
                throw signInError
            }

            return { success: true, data }
        } catch (err: any) {
            console.error('Google login error:', err)
            error.value = err.message || 'Error signing in with Google'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    // Reset password
    const resetPassword = async (email: string) => {
        loading.value = true
        error.value = null

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`
            })

            if (resetError) {
                throw resetError
            }

            return { success: true }
        } catch (err: any) {
            console.error('Password reset error:', err)
            error.value = err.message || 'Error saat reset kata sandi'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    // Sign out
    const signOut = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            loading.value = true
            const { error } = await supabase.auth.signOut()

            if (error) {
                throw error
            }

            // Clear user data
            user.value = null
            userProfile.value = null
            userRole.value = null
            session.value = null

            return { success: true }
        } catch (err: any) {
            console.error('Error signing out:', err)
            error.value = err.message || 'Error signing out'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    // Clear errors
    const clearError = () => {
        error.value = null
        shouldUseGoogle.value = false
    }

    return {
        user,
        session,
        loading,
        error,
        shouldUseGoogle,
        isLoggedIn,
        userRole,
        userProfile,
        isAdmin,
        isCustomer,
        initialize,
        signIn,
        signUp,
        googleSignIn,
        resetPassword,
        signOut,
        clearError,
        fetchUserProfile,
        ensureProfile
    }
})
