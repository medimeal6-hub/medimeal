package com.medimeal.pages;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class AppointmentPage {
    private WebDriver driver;
    private WebDriverWait wait;

    @FindBy(xpath = "//a[contains(text(),'Appointment') or contains(text(),'Book')] | //button[contains(text(),'Book Appointment')]")
    private WebElement appointmentLink;

    @FindBy(xpath = "//button[contains(text(),'Book Appointment')]")
    private WebElement bookAppointmentButton;

    @FindBy(xpath = "//select[@name='doctorId'] | //select[contains(@class,'doctor')]")
    private WebElement doctorDropdown;

    @FindBy(xpath = "//input[@type='date']")
    private WebElement dateInput;

    @FindBy(xpath = "//input[@type='time']")
    private WebElement timeInput;

    @FindBy(xpath = "//textarea[@placeholder='Describe your symptoms or reason for the appointment'] | //textarea[contains(@class,'reason')]")
    private WebElement reasonTextarea;

    @FindBy(xpath = "//button[contains(text(),'Book') or contains(text(),'Submit') or contains(text(),'Confirm')]")
    private WebElement bookButton;

    @FindBy(xpath = "//button[contains(@class,'close')] | //button[@aria-label='Close'] | //button[contains(text(),'×')] | //button[contains(text(),'Close')]")
    private WebElement closeModalButton;

    @FindBy(xpath = "//div[contains(@class,'modal')] | //div[@role='dialog']")
    private WebElement modal;

    @FindBy(xpath = "//div[contains(@class,'success')] | //div[contains(text(),'success')]")
    private WebElement successMessage;

    @FindBy(xpath = "//div[contains(@class,'doctor-card')] | //button[contains(@class,'doctor')]")
    private List<WebElement> doctorCards;

    public AppointmentPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        PageFactory.initElements(driver, this);
    }

    public void navigateToAppointments() {
        wait.until(ExpectedConditions.elementToBeClickable(appointmentLink));
        appointmentLink.click();
        // Wait for page to load
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public void openBookingModal() {
        wait.until(ExpectedConditions.elementToBeClickable(bookAppointmentButton));
        bookAppointmentButton.click();
        // Wait for modal to appear and be ready
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public void selectDoctor(String doctorName) {
        try {
            // Try dropdown first
            wait.until(ExpectedConditions.visibilityOf(doctorDropdown));
            Select select = new Select(doctorDropdown);
            select.selectByVisibleText(doctorName);
        } catch (Exception e) {
            // Try clicking doctor card
            for (WebElement card : doctorCards) {
                if (card.getText().contains(doctorName)) {
                    card.click();
                    break;
                }
            }
        }
    }

    public void selectFirstAvailableDoctor() {
        try {
            // Wait for dropdown to be visible and interactable
            wait.until(ExpectedConditions.visibilityOf(doctorDropdown));
            wait.until(ExpectedConditions.elementToBeClickable(doctorDropdown));
            Thread.sleep(500); // Small delay for dropdown to be ready
            
            Select select = new Select(doctorDropdown);
            // Get all options and select the first non-empty one
            if (select.getOptions().size() > 1) {
                select.selectByIndex(1); // Select first doctor (index 0 is usually placeholder)
            }
        } catch (Exception e) {
            System.err.println("Error selecting doctor: " + e.getMessage());
            // Try clicking first doctor card if dropdown fails
            if (!doctorCards.isEmpty()) {
                doctorCards.get(0).click();
            }
        }
    }

    public void enterDate(String date) {
        wait.until(ExpectedConditions.visibilityOf(dateInput));
        wait.until(ExpectedConditions.elementToBeClickable(dateInput));
        dateInput.clear();
        dateInput.sendKeys(date);
    }

    public void enterTime(String time) {
        wait.until(ExpectedConditions.visibilityOf(timeInput));
        wait.until(ExpectedConditions.elementToBeClickable(timeInput));
        timeInput.clear();
        timeInput.sendKeys(time);
    }

    public void enterReason(String reason) {
        try {
            wait.until(ExpectedConditions.visibilityOf(reasonTextarea));
            wait.until(ExpectedConditions.elementToBeClickable(reasonTextarea));
            reasonTextarea.clear();
            reasonTextarea.sendKeys(reason);
        } catch (Exception e) {
            // Reason might be optional
            System.out.println("Reason field not found or not required");
        }
    }

    public void clickBookButton() {
        try {
            // Wait for any overlays to disappear
            Thread.sleep(500);
            
            // Wait for button to be clickable
            wait.until(ExpectedConditions.elementToBeClickable(bookButton));
            
            // Scroll button into view if needed
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", bookButton);
            Thread.sleep(300);
            
            // Try regular click first
            try {
                bookButton.click();
            } catch (Exception e) {
                // If regular click fails, use JavaScript click
                System.out.println("Regular click failed, using JavaScript click");
                ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", bookButton);
            }
            
            // Wait for submission to process
            Thread.sleep(2000);
            
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public void closeModal() {
        try {
            // Try to close modal if it's still open
            if (modal.isDisplayed()) {
                try {
                    // Try close button first
                    if (closeModalButton.isDisplayed()) {
                        closeModalButton.click();
                        Thread.sleep(500);
                    }
                } catch (Exception e) {
                    // If no close button, press ESC key
                    System.out.println("No close button found, pressing ESC");
                    Actions actions = new Actions(driver);
                    actions.sendKeys(Keys.ESCAPE).perform();
                    Thread.sleep(500);
                }
            }
        } catch (Exception e) {
            // Modal might already be closed
            System.out.println("Modal already closed or not found");
        }
    }

    public boolean isAppointmentBooked() {
        try {
            wait.until(ExpectedConditions.visibilityOf(successMessage));
            return successMessage.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void bookAppointment(String date, String time, String reason) {
        try {
            openBookingModal();
            Thread.sleep(500); // Wait for modal animation
            
            selectFirstAvailableDoctor();
            Thread.sleep(300);
            
            enterDate(date);
            Thread.sleep(300);
            
            enterTime(time);
            Thread.sleep(300);
            
            enterReason(reason);
            Thread.sleep(500); // Wait before clicking submit
            
            clickBookButton();
            
            // Close modal after booking
            Thread.sleep(1000);
            closeModal();
            
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
