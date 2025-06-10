import 'dotenv/config'

export const PORT = process.env.PORT || 3000
const DOMAIN = process.env.DOMAIN
const allowedOrigins = ['http://localhost:4321', DOMAIN]
export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('El origen no está permitido'));
    },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}
export const TURSO_URL = process.env.TURSO_DATABASE_URL
export const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN

export const titleToValidName = (title) => {
  return title
  .toLowerCase()
  .replace(/[áäâà]/g, 'a') 
  .replace(/[éëêè]/g, 'e')
  .replace(/[íïîì]/g, 'i') 
  .replace(/[óöôò]/g, 'o')
  .replace(/[úüûù]/g, 'u')
  .replace(/ñ/g, 'n')
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim()
}