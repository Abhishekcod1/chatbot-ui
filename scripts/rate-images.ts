import fs from 'fs'
import path from 'path'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function rateImage(filePath: string): Promise<string> {
  const ext = path.extname(filePath).replace('.', '') || 'png'
  const b64 = fs.readFileSync(filePath, { encoding: 'base64' })
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Rate the quality of this graphic on a scale of 1-10. Only respond with the number.'
          },
          {
            type: 'image_url',
            image_url: `data:image/${ext};base64,${b64}`
          }
        ]
      }
    ],
    max_tokens: 5
  })

  return response.choices[0].message.content?.trim() || 'N/A'
}

async function main() {
  const dir = process.argv[2]
  if (!dir) {
    console.error('Usage: ts-node scripts/rate-images.ts <directory>')
    process.exit(1)
  }

  const files = fs.readdirSync(dir).filter(f => /\.(png|jpe?g|gif)$/i.test(f))
  for (const file of files) {
    const filePath = path.join(dir, file)
    try {
      const rating = await rateImage(filePath)
      console.log(`${file}: ${rating}`)
    } catch (err: any) {
      console.error(`${file}: Failed to rate - ${err.message}`)
    }
  }
}

main().catch(err => {
  console.error('Unexpected error', err)
  process.exit(1)
})
