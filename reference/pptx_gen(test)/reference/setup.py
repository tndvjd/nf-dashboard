from cx_Freeze import setup, Executable
import os

# Playwright 브라우저 바이너리 경로 설정
playwright_browsers_path = os.path.join(os.path.expanduser("~"), "AppData", "Local", "ms-playwright")

build_exe_options = {
    "packages": ["os", "asyncio", "PyQt6", "playwright"],
    "include_files": [
        ("template.pptx", "template.pptx"),
        ("template_ja.pptx", "template_ja.pptx"),
        ("글로벌부동산.jpg", "글로벌부동산.jpg"),
        ("회사로고.png", "회사로고.png"),
        (playwright_browsers_path, "ms-playwright")
    ],
    "excludes": ["PyQt5"]
}


setup(
    name="NF 물건자료 생성기",
    version="1.0",
    description="뉴퍼스트 물건자료를 편리하게 생성할 수 있는 프로그램입니다.",
    options={"build_exe": build_exe_options},
    executables=[Executable("main.py")]
)