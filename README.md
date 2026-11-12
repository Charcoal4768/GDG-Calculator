# Stack-Based Calculator

A Flask calculator using Jinja templates, a static stylesheet, and a two-stack arithmetic evaluator.

## Setup

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install the project dependencies into the virtual environment:

```bash
python -m pip install -r requirements.txt
```

Run the development server on your computer:

```bash
python app.py
```

Open <http://127.0.0.1:5000/>.

The server binds to all network interfaces on port `5000`. To connect from another device on the same network, use this computer's LAN IP address, for example `http://192.168.1.23:5000/`. Find the address with:

```bash
ip -4 addr
```

Allow TCP port `5000` through the firewall if needed. This is Flask's development server; use it only on a trusted local network, not as a public production server.

## Local history

Successful calculations are saved in the current browser's local storage, so history remains available on that device between visits. Select a history entry to restore its expression and result, or choose **Clear history** to remove saved calculations. The list keeps the 20 most recent calculations.

## API

`POST /calculate` accepts a JSON body containing an `expression` string and returns a JSON result. It evaluates decimal arithmetic with `+`, `-`, `*`, and `/`, operator precedence, and nested parentheses.
