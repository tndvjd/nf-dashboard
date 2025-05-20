import asyncio
import aiohttp
import logging
import requests
import terms
import re

logging.basicConfig(level=logging.DEBUG)
DEEPL_API_KEY = "093ff8cf-edd2-49a1-82de-eb60b1ed42c1:fx"

class DeepLTranslator:
    def __init__(self, api_key=DEEPL_API_KEY):
        self.api_key = api_key
        self.api_url = "https://api-free.deepl.com/v2/translate"
        self.logger = logging.getLogger(__name__)
        self.glossary_id = None

    async def translate_text(self, text, target_lang='JA'):
        async with aiohttp.ClientSession() as session:
            try:
                # terms.terms 딕셔너리 사용하여 텍스트 치환
                for korean, japanese in terms.terms.items():
                    if korean == "동":
                        # "동"을 문맥에 따라 치환
                        text = re.sub(r'(\d+동)', lambda m: m.group(1).replace("동", "棟"), text)  # 숫자 + 동 -> 棟
                        text = re.sub(r'(\w+동)', lambda m: m.group(1).replace("동", "洞"), text)  # 단어 + 동 -> 洞
                    else:
                        text = text.replace(korean, japanese)

                params = {
                    'auth_key': self.api_key,
                    'text': text,
                    'target_lang': target_lang,
                    'source_lang': 'KO'
                }
                
                self.logger.debug(f"Translation params: {params}")
                
                async with session.post(self.api_url, data=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.logger.debug(f"Translation response: {data}")
                        return data['translations'][0]['text']
                    else:
                        self.logger.error(f"DeepL API 오류: {response.status} - {await response.text()}")
                        return text
            except Exception as e:
                self.logger.error(f"번역 중 오류 발생: {str(e)}")
                return text

    async def translate_batch(self, texts, target_lang='JA'):
        async with aiohttp.ClientSession() as session:
            try:
                # terms.terms 딕셔너리 사용하여 텍스트 치환
                for i in range(len(texts)):
                    for korean, japanese in terms.terms.items():
                        if korean == "동":
                            # "동"을 문맥에 따라 치환
                            texts[i] = re.sub(r'(\d+동)', lambda m: m.group(1).replace("동", "棟"), texts[i])  # 숫자 + 동 -> 棟
                            texts[i] = re.sub(r'(\w+동)', lambda m: m.group(1).replace("동", "洞"), texts[i])  # 단어 + 동 -> 洞
                        else:
                            texts[i] = texts[i].replace(korean, japanese)

                params = {
                    'auth_key': self.api_key,
                    'text': texts,
                    'target_lang': target_lang,
                    'source_lang': 'KO'
                }
                
                self.logger.debug(f"Translation params: {params}")
                
                async with session.post(self.api_url, data=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.logger.debug(f"Translation response: {data}")
                        return [translation['text'] for translation in data['translations']]
                    else:
                        self.logger.error(f"DeepL API 오류: {response.status} - {await response.text()}")
                        return texts
            except Exception as e:
                self.logger.error(f"번역 중 오류 발생: {str(e)}")
                return texts

    async def translate_dict(self, data, fields_to_translate, target_lang='JA'):
        texts = [data[field] for field in fields_to_translate if field in data]
        translated_texts = await self.translate_batch(texts, target_lang)
        
        for field, translated_text in zip(fields_to_translate, translated_texts):
            if field in data:
                data[field] = translated_text
        
        return data

    def list_glossaries(self):
        headers = {"Authorization": f"DeepL-Auth-Key {self.api_key}"}
        
        self.logger.debug("Requesting glossaries list")
        response = requests.get(self.glossary_url, headers=headers)
        
        if response.status_code == 200:
            glossaries = response.json()["glossaries"]
            self.logger.info(f"Found {len(glossaries)} glossaries")
            for glossary in glossaries:
                print(f"Glossary ID: {glossary['glossary_id']}")
                print(f"Name: {glossary['name']}")
                print(f"Source Language: {glossary['source_lang']}")
                print(f"Target Language: {glossary['target_lang']}")
                print(f"Creation Time: {glossary['creation_time']}")
                print(f"Entry Count: {glossary['entry_count']}")
                print("---")
        else:
            self.logger.error(f"Error listing glossaries: {response.status_code} - {response.text}")

    def create_glossary(self, name, source_lang, target_lang, entries):
        headers = {
            "Authorization": f"DeepL-Auth-Key {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "name": name,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "entries": entries,
            "entries_format": "tsv"  # Add this line
        }
        
        self.logger.debug(f"Creating glossary with data: {data}")
        response = requests.post(self.glossary_url, headers=headers, json=data)
        
        if response.status_code == 201:
            self.logger.info("Glossary created successfully")
            return response.json()["glossary_id"]
        else:
            self.logger.error(f"Error creating glossary: {response.status_code} - {response.text}")
            return None

async def test_translator():
    translator = DeepLTranslator()
    
    # 단일 텍스트 번역 테스트
    original_text = "안녕하세요. 관리비는 40만원입니다."
    translated_text = await translator.translate_text(original_text)
    print(f"원본: {original_text}")
    print(f"번역: {translated_text}")

if __name__ == "__main__":
    asyncio.run(test_translator())