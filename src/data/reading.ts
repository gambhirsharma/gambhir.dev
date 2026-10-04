import type { ReadingData } from '@/types'

// Papers, theses and long-form tech articles I'm reading or want to read.
// Shown on /blog/papers; items with status 'reading' also show up on the home page.
// To write longer notes on one, add a post to src/content/blog/papers/ and set `note` to its slug.
const reading: ReadingData = [
  {
    title: 'Integrated Sensing and Communications: Toward Dual-Functional Wireless Networks for 6G and Beyond',
    url: 'https://arxiv.org/abs/2108.07165',
    authors: 'Liu et al.',
    year: 2022,
    kind: 'paper',
    status: 'reading',
    topic: '6g',
  },
  {
    title: 'The rsync algorithm',
    url: 'https://rsync.samba.org/tech_report/',
    authors: 'Tridgell & Mackerras',
    year: 1996,
    kind: 'paper',
    status: 'reading',
    topic: 'algorithms',
  },
  {
    title: 'Extend Cloud to Edge with KubeEdge',
    url: 'https://ieeexplore.ieee.org/document/8567697',
    authors: 'Xiong et al.',
    year: 2018,
    kind: 'paper',
    status: 'read',
    topic: 'edge',
  },
  {
    title: 'Borg, Omega, and Kubernetes',
    url: 'https://queue.acm.org/detail.cfm?id=2898444',
    authors: 'Burns et al.',
    year: 2016,
    kind: 'article',
    status: 'queued',
    topic: 'k8s',
  },
]

export default reading
