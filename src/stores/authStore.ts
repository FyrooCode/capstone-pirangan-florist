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
        console.log('userData received:', userData)

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
                console.log('Creating new profile for user:', user.value.id)

                // Extract name from userData parameter first, then fallback to user metadata
                let firstName = userData?.firstName || ''
                let lastName = userData?.lastName || ''

                // If no firstName/lastName provided in userData, try to extract from user metadata
                if (!firstName && !lastName) {
                    if (user.value.app_metadata?.provider === 'google') {
                        // For Google Authentication, parse the name from user metadata
                        console.log('Extracting name from Google metadata:', user.value.user_metadata)
                        firstName = user.value.user_metadata?.given_name ||
                            user.value.user_metadata?.name?.split(' ')[0] || ''

                        lastName = user.value.user_metadata?.family_name ||
                            (user.value.user_metadata?.name?.split(' ').length > 1 ?
                                user.value.user_metadata?.name?.split(' ').slice(1).join(' ') : '')
                    } else {
                        // For email/password registration, try to get from auth metadata
                        firstName = user.value.user_metadata?.first_name || ''
                        lastName = user.value.user_metadata?.last_name || ''
                    }
                }

                console.log('Using firstName:', firstName, 'lastName:', lastName)

                // Create profile with default role (customer)
                const profileData = {
                    user_id: user.value.id,
                    first_name: firstName || null,  // Ensure we don't pass empty strings
                    last_name: lastName || null,    // Ensure we don't pass empty strings
                    role: 'customer', // Default role
                    created_at: now,
                    updated_at: now
                }

                console.log('Attempting to insert profile data:', JSON.stringify(profileData, null, 2))

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

    // Function to check if email is already registered
    const checkEmailExists = async (email: string) => {
        try {
            // Use Supabase's built-in method to check if user exists
            // This will attempt to send a magic link but we'll catch the response
            const { data, error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: false // This prevents creating a new user
                }
            })

            // If no error, it means the email exists in the system
            if (!error) {
                return { exists: true, provider: 'email' }
            }

            // Check specific error messages to determine if email exists
            if (error.message.includes('Email not confirmed')) {
                return { exists: true, provider: 'email' }
            }

            if (error.message.includes('only email is allowed') || 
                error.message.includes('email not found') ||
                error.message.includes('invalid email')) {
                return { exists: false, provider: null }
            }

            // For any other error, assume email doesn't exist to allow registration
            return { exists: false, provider: null }
        } catch (err) {
            console.error('Error checking email:', err)
            // If we can't check, allow registration to proceed
            return { exists: false, provider: null }
        }
    }

    // Enhanced sign up function with proper email checking
    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
        loading.value = true
        error.value = null
        shouldUseGoogle.value = false

        try {
            // First, check if email already exists
            console.log('Checking if email exists:', email)
            const { exists, provider } = await checkEmailExists(email)
            
            if (exists) {
                if (provider === 'google') {
                    error.value = 'Email sudah terdaftar dengan akun Google. Silakan gunakan "Masuk dengan Google".'
                } else {
                    error.value = 'Email sudah terdaftar. Silakan login atau gunakan email lain.'
                }
                return { success: false }
            }

            // Proceed with sign up since email doesn't exist
            console.log('Email not found, proceeding with registration')
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
                // Handle specific Supabase errors
                if (signUpError.message.includes('User already registered') || 
                    signUpError.message.includes('email address is already registered')) {
                    error.value = 'Email sudah terdaftar. Silakan login atau gunakan email lain.'
                    return { success: false }
                }
                throw signUpError
            }

            // Handle successful registration
            if (data?.user) {
                console.log('User registered successfully:', {
                    id: data.user.id,
                    email: data.user.email,
                    confirmed: !!data.user.email_confirmed_at
                })

                // Create user profile for new registrations
                await ensureProfile({
                    firstName,
                    lastName
                })

                return { success: true, user: data.user }
            } else {
                error.value = 'Gagal membuat akun. Silakan coba lagi.'
                return { success: false }
            }
        } catch (err: any) {
            console.error('Registration error:', err)
            
            // Handle specific error messages
            if (err.message.includes('User already registered') || 
                err.message.includes('email address is already registered') ||
                err.message.includes('already been registered')) {
                error.value = 'Email sudah terdaftar. Silakan login.'
            } else if (err.message.includes('rate limit')) {
                error.value = 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.'
            } else {
                error.value = err.message || 'Error saat mendaftar'
            }
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    // Enhanced sign in with better error handling
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
                // For invalid credentials, check if the user might be using Google auth
                if (signInError.message.includes('Invalid login credentials')) {
                    // Try to check if this email exists (but don't show the details to user)
                    const { exists } = await checkEmailExists(email)
                    
                    if (exists) {
                        // Email exists but password is wrong - could be Google user
                        error.value = 'Email atau kata sandi tidak valid. Jika Anda mendaftar dengan Google, silakan gunakan tombol "Masuk dengan Google".'
                    } else {
                        error.value = 'Email atau kata sandi tidak valid.'
                    }
                } else {
                    throw signInError
                }
                return { success: false }
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
            return { success: false, error: error.value || undefined }
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
            return { success: false, error: error.value || undefined }
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
            return { success: false, error: error.value || undefined }
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
