from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("http://localhost:8000/gui/html/page_main.html")


print(driver.title)
driver.implicitly_wait(1)

file_table = driver.find_element(by=By.ID, value="filetable")

#file_names = file_table.find_elements(by=By.XPATH, value=".//td")

#print(len(file_names))

#for f in file_names:
#    print(f.text)

#driver.quit()
