// The @uppy/ dependencies are resolved from source
/* eslint-disable import/no-extraneous-dependencies */
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import Instagram from '@uppy/instagram'
import Facebook from '@uppy/facebook'
import OneDrive from '@uppy/onedrive'
import Dropbox from '@uppy/dropbox'
import Box from '@uppy/box'
import GoogleDrive from '@uppy/google-drive'
import Unsplash from '@uppy/unsplash'
import Zoom from '@uppy/zoom'
import Url from '@uppy/url'
import Webcam from '@uppy/webcam'
import ScreenCapture from '@uppy/screen-capture'
import GoldenRetriever from '@uppy/golden-retriever'
import Tus from '@uppy/tus'
import AwsS3 from '@uppy/aws-s3'
import AwsS3Multipart from '@uppy/aws-s3-multipart'
import XHRUpload from '@uppy/xhr-upload'
import Transloadit from '@uppy/transloadit'
import Form from '@uppy/form'
import ImageEditor from '@uppy/image-editor'
import DropTarget from '@uppy/drop-target'
import Audio from '@uppy/audio'
import Compressor from '@uppy/compressor'
/* eslint-enable import/no-extraneous-dependencies */

// DEV CONFIG: create a .env file in the project root directory to customize those values.
const {
  VITE_UPLOADER : UPLOADER,
  VITE_COMPANION_URL : COMPANION_URL,
  VITE_TUS_ENDPOINT : TUS_ENDPOINT,
  VITE_XHR_ENDPOINT : XHR_ENDPOINT,
  VITE_TRANSLOADIT_KEY : TRANSLOADIT_KEY,
  VITE_TRANSLOADIT_TEMPLATE : TRANSLOADIT_TEMPLATE,
  VITE_TRANSLOADIT_SERVICE_URL : TRANSLOADIT_SERVICE_URL,
  VITE_COMPANION_KEYS_PARAMS_KEY: COMPANION_KEYS_PARAMS_KEY,
  VITE_COMPANION_KEYS_PARAMS_CREDENTIALS_NAME: COMPANION_KEYS_PARAMS_CREDENTIALS_NAME,
} = import.meta.env

import.meta.env.VITE_TRANSLOADIT_KEY = '***' // to avoid leaking secrets in screenshots.
console.log(import.meta.env)

// DEV CONFIG: enable or disable Golden Retriever

const RESTORE = false

// Rest is implementation! Obviously edit as necessary...

export default () => {
  const commonProviderOptions = { target: Dashboard, companionUrl: COMPANION_URL }

  if (COMPANION_KEYS_PARAMS_KEY && COMPANION_KEYS_PARAMS_CREDENTIALS_NAME) {
    commonProviderOptions.companionKeysParams = {
      key: COMPANION_KEYS_PARAMS_KEY, // needs to be passed here because the provider plugins are not aware of transloadit
      credentialsName: COMPANION_KEYS_PARAMS_CREDENTIALS_NAME,
    }
  }

  const uppyDashboard = new Uppy({
    logger: Uppy.debugLogger,
    meta: {
      username: 'John',
      license: 'Creative Commons',
    },
    allowMultipleUploadBatches: false,
    // restrictions: { requiredMetaFields: ['caption'] },
  })
    .use(Dashboard, {
      trigger: '#pick-files',
      // inline: true,
      target: '.foo',
      metaFields: [
        { id: 'license', name: 'License', placeholder: 'specify license' },
        { id: 'caption', name: 'Caption', placeholder: 'add caption' },
      ],
      showProgressDetails: true,
      proudlyDisplayPoweredByUppy: true,
      note: '2 files, images and video only',
    })
    .use(GoogleDrive, commonProviderOptions)
    .use(Instagram, commonProviderOptions)
    .use(Dropbox, commonProviderOptions)
    .use(Box, commonProviderOptions)
    .use(Facebook, commonProviderOptions)
    .use(OneDrive, commonProviderOptions)
    .use(Zoom, commonProviderOptions)
    .use(Url, commonProviderOptions)
    .use(Unsplash, commonProviderOptions)
    .use(Webcam, {
      target: Dashboard,
      showVideoSourceDropdown: true,
      showRecordingLength: true,
    })
    .use(Audio, {
      target: Dashboard,
      showRecordingLength: true,
    })
    .use(ScreenCapture, { target: Dashboard })
    .use(Form, { target: '#upload-form' })
    .use(ImageEditor, { target: Dashboard })
    .use(DropTarget, {
      target: document.body,
    })
    .use(Compressor)

  switch (UPLOADER) {
    case 'tus':
      uppyDashboard.use(Tus, { endpoint: TUS_ENDPOINT, limit: 6 })
      break
    case 's3':
      uppyDashboard.use(AwsS3, { companionUrl: COMPANION_URL, limit: 6 })
      break
    case 's3-multipart':
      uppyDashboard.use(AwsS3Multipart, { companionUrl: COMPANION_URL, limit: 6 })
      break
    case 'xhr':
      uppyDashboard.use(XHRUpload, { endpoint: XHR_ENDPOINT, limit: 6, bundle: true })
      break
    case 'transloadit':
      uppyDashboard.use(Transloadit, {
        service: TRANSLOADIT_SERVICE_URL,
        waitForEncoding: true,
        params: {
          auth: { key: TRANSLOADIT_KEY },
          template_id: TRANSLOADIT_TEMPLATE,
        },
      })
      break
    case 'transloadit-s3':
      uppyDashboard.use(AwsS3, { companionUrl: COMPANION_URL })
      uppyDashboard.use(Transloadit, {
        waitForEncoding: true,
        importFromUploadURLs: true,
        params: {
          auth: { key: TRANSLOADIT_KEY },
          template_id: TRANSLOADIT_TEMPLATE,
        },
      })
      break
    case 'transloadit-xhr':
      uppyDashboard.setMeta({
        params: JSON.stringify({
          auth: { key: TRANSLOADIT_KEY },
          template_id: TRANSLOADIT_TEMPLATE,
        }),
      })
      uppyDashboard.use(XHRUpload, {
        method: 'POST',
        endpoint: `${TRANSLOADIT_SERVICE_URL}/assemblies`,
        metaFields: ['params'],
        bundle: true,
      })
      break
    default:
  }

  if (RESTORE) {
    uppyDashboard.use(GoldenRetriever, { serviceWorker: true })
  }

  window.uppy = uppyDashboard

  uppyDashboard.on('complete', (result) => {
    if (result.failed.length === 0) {
      console.log('Upload successful 😀')
    } else {
      console.warn('Upload failed 😞')
    }
    console.log('successful files:', result.successful)
    console.log('failed files:', result.failed)
    if (UPLOADER === 'transloadit') {
      console.log('Transloadit result:', result.transloadit)
    }
  })

  const modalTrigger = document.querySelector('#pick-files')
  if (modalTrigger) modalTrigger.click()
}
