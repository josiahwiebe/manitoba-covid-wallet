import Head from 'next/head'
import { useState } from 'react'
import QrScanner from 'qr-scanner'

export default function Index() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [name, setName] = useState(null)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    e.preventDefault()
    setName(e.target.value)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return

    QrScanner.scanImage(file)
      .then((result) => setQrData(result))
      .catch((err) => setError('Could not read QR code from file. Please try again.'))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        qrData: qrData,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const blob = await result.blob()
    const objUrl = URL.createObjectURL(blob)
    setLoading(false)
    setResult(objUrl)
    e.target.reset()
  }

  return (
    <div className='bg-gray-100 mx-auto py-12 px-5 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center'>
      <Head>
        <title>Manitoba COVID-19 Immunization Wallet Generator</title>
      </Head>

      <main className='max-w-3xl mx-auto"'>
        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='px-4 py-5 sm:px-6 flex flex-col md:flex-row items-center'>
            <img className='w-48 md:mr-6 mb-4 md:mb-0' src='/manitoba.svg' />
            <h1 className='text-2xl font-bold'>Immunization Wallet Generator</h1>
          </div>

          <div className='px-4 py-5 sm:p-6'>
            {result ? (
              <div className='flex flex-col items-center justify-center'>
                <div className='mb-4'>
                  <a
                    className='bg-green-600 inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white hover:bg-green-900 active:bg-green-900'
                    href={result}
                    download='Immunization-Card.pkpass'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-6 w-6 mr-2'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'>
                      <path
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                      />
                    </svg>
                    Download Wallet Pass
                  </a>
                </div>
                <div>
                  <button className='inline-flex' type='button' onClick={() => setResult(null)}>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-6 w-6 mr-2'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'>
                      <path
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                      />
                    </svg>
                    Start over
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                  <label className='block text-md font-medium' htmlFor='qr'>
                    Upload a screenshot of your Manitoba COVID-19 Immunization Certificate
                  </label>
                  <input className='my-2' type='file' name='qr' onChange={handleFile} required />
                  {error && <span className='text-red-600 block'>{error}</span>}
                </div>
                <div className='mb-3'>
                  <label className='block text-md font-medium' htmlFor='name'>
                    Enter your name as it appears on the certificate
                  </label>
                  <input
                    className='border-2 border-gray-600 my-2 focus:ring-0 focus:ring-transparent focus:border-green-600'
                    type='text'
                    name='name'
                    autocapitalize='word'
                    placeholder='Jane Malcolm'
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className='mb-3'>
                  <button
                    type='submit'
                    disabled={loading}
                    className={`${
                      loading
                        ? 'bg-red-500 hover:bg-red-500 active:bg-red-500 hover:cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-900 active:bg-green-900'
                    } inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white `}>
                    {loading ? (
                      <>
                        <svg
                          class='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'>
                          <circle
                            class='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            stroke-width='4'></circle>
                          <path
                            class='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                        </svg>
                        Processing
                      </>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className='bg-gray-50 px-4 py-5 sm:p-6'>
            <p className='text-sm'> This is not a website created or sponsored by the Manitoba Government.</p>
            <p className='text-sm'>We do not save any of your data.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
