# Email Configuration for gambhir.dev

This document explains how email is configured for the `gambhir.dev` domain.

## Overview

| Step | Provider | Purpose |
|------|----------|---------|
| 1 | **Cloudflare** | DNS management (NS moved from Spaceship) |
| 2 | **Cloudflare Email Routing** | Email forwarding for `hey@gambhir.dev` |
| 3 | **Resend** | SMTP relay (sending emails) |
| 4 | **Gmail** | Send-as via Resend SMTP |

## Step-by-step

### 1. DNS — Cloudflare

The nameservers were changed from **Spaceship** (formerly Namecheap) to **Cloudflare**. Cloudflare now manages all DNS records for `gambhir.dev`.

Relevant DNS records:

| Type | Name | Value | Notes |
|------|------|-------|-------|
| MX | `gambhir.dev` | `mx1.simplelogin.co` / `mx2.simplelogin.co` | (if using SimpleLogin) |
| TXT | `gambhir.dev` | `v=spf1 include:spf.resend.com ~all` | SPF for Resend |
| TXT | `resend._domainkey.gambhir.dev` | `dkim.resend.com` | DKIM for Resend |

> **Note:** Cloudflare Email Routing requires MX records to be handled by Cloudflare's own mail infrastructure. If you're using Cloudflare Email Routing, the MX record points to Cloudflare, not SimpleLogin.

### 2. Email Forwarding — Cloudflare Email Routing

Cloudflare Email Routing forwards emails sent to `hey@gambhir.dev` to a personal Gmail address.

- **Destination:** `hey@gambhir.dev` → your personal Gmail inbox
- **Catch-all:** (optional) forwards any `*@gambhir.dev` address

Cloudflare Email Routing handles inbound delivery so you receive emails at your Gmail without exposing your real Gmail address.

### 3. SMTP — Resend

**Resend** is used as the SMTP provider to send emails from `hey@gambhir.dev`.

- **SMTP Host:** `smtp.resend.com`
- **Port:** `587` (STARTTLS) or `465` (SSL)
- **Authentication:** SMTP credentials generated from Resend dashboard
- **DKIM:** Configured via DNS TXT records (added automatically by Resend)

### 4. Sending from Gmail

Gmail's **"Send mail as"** feature is configured with Resend's SMTP settings:

1. Go to **Gmail Settings → Accounts → Send mail as → Add another email address**
2. Enter name and `hey@gambhir.dev`
3. SMTP Server: `smtp.resend.com`
4. Port: `587`
5. Username: Resend SMTP username
6. Password: Resend SMTP password (API key)

This allows composing and replying from Gmail while emails are actually sent via Resend's infrastructure, which improves deliverability.

## Flow Diagram

```
Inbound:  somebody@example.com
              ↓
    Cloudflare Email Routing
              ↓
      hey@gambhir.dev
              ↓
       Gmail Inbox
              │
Outbound:     │
    Gmail (Send as)
       ↓
  Resend SMTP
       ↓
  recipient@example.com
```

## Key Points

- **Nameservers:** Cloudflare (changed from Spaceship)
- **Domain:** gambhir.dev
- **Email address:** hey@gambhir.dev
- **Inbound:** Cloudflare Email Routing → Gmail
- **Outbound:** Gmail → Resend SMTP → Internet

## Email Signature

HTML email signature lives at:

```
public/email-footer.html
```

Raw `<table>` block — no wrapper HTML. To use in Gmail:
1. Open file in browser
2. Select all → copy
3. Paste into Gmail → Settings → General → Signature editor

Image references `https://gambhir.dev/me.png` (must be deployed to be visible in recipients' clients).

## Updates

### 2026-05 — Migrated from Cloudflare to Spaceship NS

Nameservers moved back from **Cloudflare** to **Spaceship**. DNS is now managed directly through Spaceship.

Email forwarding switched from **Cloudflare Email Routing** to **Spaceship Email Forwarding**.

- `hey@gambhir.dev` → personal Gmail (via Spaceship forwarder)
- No longer using Cloudflare for DNS or inbound mail routing
- Resend SMTP still used for outbound sending via Gmail "Send mail as"

Updated flow:

```
Inbound:  somebody@example.com
              ↓
  Spaceship Email Forwarding
              ↓
      hey@gambhir.dev
              ↓
       Gmail Inbox
              │
Outbound:     │
    Gmail (Send as)
       ↓
  Resend SMTP
       ↓
  recipient@example.com
```
