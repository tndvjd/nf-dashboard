import sys
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QPushButton, QTextEdit

class PropertyInfoGUI(QWidget):
    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        self.setWindowTitle('다중 부동산 정보 스크래퍼')
        self.setGeometry(300, 300, 600, 500)

        layout = QVBoxLayout()

        url_layout = QVBoxLayout()
        url_label = QLabel('부동산 URL들 (한 줄에 하나씩 입력):')
        self.url_input = QTextEdit()
        self.url_input.setPlaceholderText("https://example.com/property1\nhttps://example.com/property2\n...")
        url_layout.addWidget(url_label)
        url_layout.addWidget(self.url_input)

        customer_layout = QHBoxLayout()
        customer_label = QLabel('고객명:')
        self.customer_input = QLineEdit()
        customer_layout.addWidget(customer_label)
        customer_layout.addWidget(self.customer_input)

        self.submit_button = QPushButton('실행')
        self.submit_button.clicked.connect(self.on_submit)

        self.result_area = QTextEdit()
        self.result_area.setReadOnly(True)

        layout.addLayout(url_layout)
        layout.addLayout(customer_layout)
        layout.addWidget(self.submit_button)
        layout.addWidget(self.result_area)

        self.setLayout(layout)

    def on_submit(self):
        urls = self.url_input.toPlainText().split('\n')
        urls = [url.strip() for url in urls if url.strip()]
        customer_name = self.customer_input.text()
        
        if not urls or not customer_name:
            self.result_area.setText("URL과 고객명을 모두 입력해주세요.")
            return

        self.result_area.setText("처리 시작...")
        self.submit_button.setEnabled(False)
        
        # 여기서 WorkerThread를 시작합니다 (main.py에서 구현)