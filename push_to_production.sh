
source .venv/bin/activate
pip install -r requirements.txt
python3 ./scripts/preprocess.py

cd supply-chain && \
npm install && \
gatsby clean && \
gatsby build && \
gsutil -m rsync -r -d public "gs://eto-tmp/eto-supply-chain/public" && \
gsutil -m -h "Cache-Control:no-cache, max-age=0" rsync -r -d "gs://eto-tmp/eto-supply-chain/public" "gs://chipexplorer.eto.tech/" && \
git tag --force deploy/previous deploy/current && \
git tag --force deploy/current HEAD && \
git push --force origin deploy/previous deploy/current
