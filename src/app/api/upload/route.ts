import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type (allow audio, image, video, document)
    const isAllowed = !file.type || 
                      file.type.startsWith('audio/') || 
                      file.type.startsWith('image/') || 
                      file.type.startsWith('video/') || 
                      file.type.includes('pdf') || 
                      file.type.includes('document') || 
                      file.type.includes('sheet') || 
                      file.type.includes('text') ||
                      file.type === 'application/octet-stream'

    if (!isAllowed) {
      return NextResponse.json({ error: 'Unsupported file format.' }, { status: 400 })
    }

    // Generate unique filename scoped under organization ID
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    let extension = file.name && file.name.includes('.') ? file.name.split('.').pop() : ''
    
    if (!extension || extension === file.name || extension === 'blob') {
      if (file.type?.includes('audio')) extension = 'mp3'
      else if (file.type?.includes('image')) extension = 'jpg'
      else if (file.type?.includes('video')) extension = 'mp4'
      else extension = 'bin'
    }

    const filename = `${orgId}/${timestamp}-${randomStr}.${extension}`
    let contentType = file.type || 'application/octet-stream'
    if (contentType === 'audio/mp3' || contentType.includes('audio') || extension === 'mp3') {
      contentType = 'audio/mpeg'
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage using admin client (bypasses RLS)
    let { data, error } = await supabaseAdmin.storage
      .from('chat-media')
      .upload(filename, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      })

    if (error && (
      error.message?.includes('Bucket not found') || 
      (error as any).statusCode === '404' || 
      String(error).includes('Bucket not found') ||
      String(error).includes('not found')
    )) {
      console.log('[upload] Bucket "chat-media" not found. Creating public bucket...')
      await supabaseAdmin.storage.createBucket('chat-media', { public: true })
      
      // Retry upload
      const retryResult = await supabaseAdmin.storage
        .from('chat-media')
        .upload(filename, buffer, {
          contentType,
          cacheControl: '3600',
          upsert: false
        })
      data = retryResult.data
      error = retryResult.error
    }

    if (error) {
      console.error('[upload] Supabase storage upload error:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('chat-media')
      .getPublicUrl(filename)

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: data?.path || filename
    })

  } catch (err: any) {
    console.error('[upload error]:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
