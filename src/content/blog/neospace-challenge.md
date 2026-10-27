---
title: NeoSpace Challenge 2026
description: Winning Best Business Case in Luxembourg with a 5G satellite alarm network
date: 2026-10-27
duration: 2min
image:
  src: /blog-assets/neospace-challenge/neospace-win.jpg
  alt: Team Lynq winning the Best Business Case Award at the NeoSpace Challenge 2026
---

> Our team **Lynq** won the **Best Business Case Award** at the NeoSpace Challenge 2026, the student hackathon at [NeoSpace Europe](https://neospace-europe.lu/) in Luxembourg 🛰️

### The challenge

[OQ Technology](https://oqtec.space/) asked: _how do you get a critical alarm from anywhere on Earth to the cloud, reliably and fast?_

### What we built

**Lynq NTN-Pulse**: a **112-satellite 5G network** that delivers alarms from anywhere on Earth to the cloud with **p99 latency under 100 ms**.

<!-- TODO: architecture diagram / screenshot -->
<!-- ![Lynq NTN-Pulse architecture](/blog-assets/neospace-challenge/architecture.png) -->

- **Simulation on MeluXina**: we simulated the constellation on [MeluXina](https://www.luxprovide.lu/meluxina/), Luxembourg's EuroHPC supercomputer, which [LuxProvide](https://www.luxprovide.lu/) and the Luxembourg AI Factory opened up to student teams.
- **Edge with KubeEdge**: I built the edge side with [KubeEdge](https://kubeedge.io/), so the alarm-raising devices are managed with the same Kubernetes tooling as the cloud.

### The code

[Lynq NTN-Pulse on GitHub](https://github.com/gambhirsharma/Lynq)

Our pitch deck: [Lynq Presentation (PDF)](/blog-assets/neospace-challenge/lynq-presentation.pdf)

### Photos

![All NeoSpace Challenge 2026 participants on stage at NeoSpace Europe](/blog-assets/neospace-challenge/group-photo.jpg)

<div class="photo-gallery">
  <a href="/blog-assets/neospace-challenge/hacking.jpg" target="_blank"><img src="/blog-assets/neospace-challenge/hacking.jpg" alt="Team Lynq working on laptops during the hackathon" loading="lazy" /></a>
  <a href="/blog-assets/neospace-challenge/tshirts.jpg" target="_blank"><img src="/blog-assets/neospace-challenge/tshirts.jpg" alt="Unpacking the NeoSpace Challenge t-shirts" loading="lazy" /></a>
  <a href="/blog-assets/neospace-challenge/tshirt.jpg" target="_blank"><img src="/blog-assets/neospace-challenge/tshirt.jpg" alt="Close-up of the NeoSpace Challenge t-shirt" loading="lazy" /></a>
  <a href="/blog-assets/neospace-challenge/award-announcement.jpg" target="_blank"><img src="/blog-assets/neospace-challenge/award-announcement.jpg" alt="Team Lynq on stage as the Best Business Model award is announced" loading="lazy" /></a>
  <a href="/blog-assets/neospace-challenge/award-celebration.jpg" target="_blank"><img src="/blog-assets/neospace-challenge/award-celebration.jpg" alt="Team Lynq holding their award certificates on stage" loading="lazy" /></a>
  <a href="/blog-assets/neospace-challenge/certificate.jpg" target="_blank"><img src="/blog-assets/neospace-challenge/certificate.jpg" alt="Certificate of Excellence for Best Business Model at the NeoSpace Challenge" loading="lazy" /></a>
</div>

### Thanks

To [Arthur Van Eeckhout](https://lu.linkedin.com/in/avaneeckhout) and the jury, the Luxembourg Space Agency, LuxProvide, the Luxembourg AI Factory, and OQ Technology for the challenge. Most of all, to my teammates **Davoud Jokar**, **Maryam Amini** and **Ines Bouissou**.

More on LinkedIn: [my post](https://lnkd.in/p/dTADxUK8) · [Arthur's post](https://lnkd.in/p/dBinzMpE)
