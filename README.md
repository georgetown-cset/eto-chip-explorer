# eto-supply-chain
ETO Products: Supply Chain Explorer

To run the data preprocessing script,

* Create a new virtualenv and install `requirements.txt`
* Run `pre-commit install`
* Run `python3 scripts/preprocess.py` (ignore the warnings for now)

To run the webapp,

* `cd supply-chain`
* `npm install`
* `gatsby develop`

To run the Jest tests, run `npm run test`.

To run the python tests, run `python3 -m pytest tests`. To run them and measure coverage, run `coverage run -m pytest tests`; you can report coverage in text format with `coverage report -m` and in HTML format with `coverage html`.
