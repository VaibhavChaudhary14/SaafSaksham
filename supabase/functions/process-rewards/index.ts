// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        const { user_id, action, amount } = await req.json()

        // TODO: Implement complex reward logic here (e.g. check caps, calculate multipliers)
        console.log(`Processing reward for user ${user_id}: ${action} (${amount})`)

        return new Response(
            JSON.stringify({ success: true, message: "Reward processed" }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        )
    }
})
