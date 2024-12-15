# Zbot Wizard

## Backend Service

Create and activate a virtual environment if you haven't already

```
conda create -n humanoid-os python=3.12
conda activate humanoid-os
```

In one terminal window, run the service.

```
python3 main.py
```

The server runs at `http://0.0.0.0:8080/`.

## Frontend 
Change into the ui directory. Install dependencies and run. 

```
cd zbot-wiz-ui
npm install
npm start
```

Locally, the react app runs is available in browser at `http://localhost:5173/`.Port number may vary.
