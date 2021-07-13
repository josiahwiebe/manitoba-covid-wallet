import { uid } from 'uid/secure'
import PassGenerator from 'passgenerator-js'

export default async (req, res) => {
  try {
    const { name, qrData } = req.body
    const sn = uid(7)
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.ca.manitoba.covid-19-immunization',
      serialNumber: sn,
      webServiceURL: 'https://govmbcitizen.b2clogin.com/',
      authenticationToken: process.env.AUTH_TOKEN,
      teamIdentifier: process.env.TEAM_ID,
      barcode: {
        altText: name,
        message: qrData,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
      },
      organizationName: 'Province of Manitoba',
      description: 'Manitoba COVID-19 Immunization Card',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(5, 125, 62)',
      generic: {
        primaryFields: [
          {
            key: 'name',
            value: 'Immunization Card',
          },
        ],
      },
    }

    const passJson = JSON.stringify(passData)

    const dataUrls = [
      {
        file: 'appleWWDRCA',
        url: `https://covid-wallet.burwal.de/assets/AppleWWDRCA.cer`,
      },
      {
        file: 'signCert',
        url: `https://covid-wallet.burwal.de/assets/pass.p12`,
      },
      {
        file: 'icon',
        url: `https://covid-wallet.burwal.de/assets/icon.png`,
      },
      {
        file: 'icon2x',
        url: `https://covid-wallet.burwal.de}/assets/icon@2x.png`,
      },
      {
        file: 'logo',
        url: `https://covid-wallet.burwal.de/assets/logo.png`,
      },
      {
        file: 'logo2x',
        url: `https://covid-wallet.burwal.de/assets/logo@2x.png`,
      },
    ]

    const fetchData = (urls) => {
      return Promise.all(
        urls.map((url) =>
          fetch(url.url)
            .then((r) => r.buffer())
            .catch((err) => {
              throw new Error(err)
            })
        )
      )
    }

    const [appleWWDRCA, signCert, icon, icon2x, logo, logo2x] = await fetchData(dataUrls)

    const jsonBuffer = Buffer.from(passJson)
    const pg = new PassGenerator({
      appleWWDRCA: appleWWDRCA,
      signCert: signCert,
    })

    const pass = pg.createPass()

    pass.add('icon.png', icon)
    pass.add('icon@2x.png', icon2x)

    pass.add('pass.json', jsonBuffer)

    pass.add('logo.png', logo, 'en')
    pass.add('logo@2x.png', logo2x, 'en')

    const pkpass = pass.generate()

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass')
    res.send(pkpass)
  } catch (err) {
    console.error(err)
    res.status(500).send('An error has occurred.')
  }
}
