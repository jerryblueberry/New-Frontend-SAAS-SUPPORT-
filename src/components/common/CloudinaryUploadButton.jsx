import React, { useRef, useState } from 'react'
import { Button, LinearProgress, Box, Typography } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'

async function compressImage(file, { maxWidth = 1800, quality = 0.82 } = {}) {
	return new Promise((resolve) => {
		try {
			if (!file.type.startsWith('image/')) return resolve(file)
			const img = new Image()
			const url = URL.createObjectURL(file)
			img.onload = () => {
				const canvas = document.createElement('canvas')
				const scale = Math.min(1, maxWidth / img.width)
				const w = Math.round(img.width * scale)
				const h = Math.round(img.height * scale)
				canvas.width = w; canvas.height = h
				const ctx = canvas.getContext('2d')
				ctx.drawImage(img, 0, 0, w, h)
				canvas.toBlob((blob) => {
					URL.revokeObjectURL(url)
					if (!blob) return resolve(file)
					const compressed = new File([blob], file.name, { type: 'image/jpeg' })
					resolve(compressed)
				}, 'image/jpeg', quality)
			}
			img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
			img.src = url
		} catch (_) { resolve(file) }
	})
}

export default function CloudinaryUploadButton({ label = 'Upload Document', onUploaded }) {
	const inputRef = useRef(null)
	const [uploading, setUploading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [successUrl, setSuccessUrl] = useState('')

	const onClick = () => inputRef.current?.click()

	const onFileChange = async (e) => {
		const file = e.target.files?.[0]
		if (!file) return
		setUploading(true)
		setProgress(10)
		try {
			const processed = await compressImage(file)
			setProgress(25)
			const formData = new FormData()
			formData.append('file', processed)
			formData.append('upload_preset', 'Certificate(Saas)')
			formData.append('folder', 'SAAS(Support Worker)')
			const cloudName = 'dgsphdhns'
			const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
				method: 'POST',
				body: formData,
			})
			if (!resp.ok) throw new Error('Upload failed')
			setProgress(80)
			const data = await resp.json()
			setProgress(100)
			setSuccessUrl(data.secure_url)
			onUploaded?.({ url: data.secure_url, publicId: data.public_id })
		} catch (e) {
			console.error(e)
		} finally {
			setTimeout(() => setUploading(false), 300)
			if (inputRef.current) inputRef.current.value = ''
		}
	}

	return (
		<Box>
			<input type="file" accept="image/*,application/pdf" hidden ref={inputRef} onChange={onFileChange} />
			<Button variant="outlined" size="small" startIcon={<CloudUpload />} onClick={onClick} disabled={uploading} sx={{ textTransform: 'none' }}>
				{label}
			</Button>
			{uploading && (
				<Box sx={{ mt: 1 }}>
					<LinearProgress variant="determinate" value={progress} />
				</Box>
			)}
			{!uploading && successUrl && (
				<Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>Uploaded</Typography>
			)}
		</Box>
	)
}
