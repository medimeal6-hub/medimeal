package com.medimeal.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class DashboardPage {
    private WebDriver driver;
    private WebDriverWait wait;

    @FindBy(xpath = "//h1[contains(text(),'Dashboard')] | //div[contains(@class,'dashboard')] | //h2[contains(text(),'Dashboard')]")
    private WebElement dashboardHeader;

    @FindBy(xpath = "//button[contains(text(),'Logout') or contains(., 'Logout')] | //span[contains(text(),'Logout')]")
    private WebElement logoutButton;

    @FindBy(xpath = "//div[contains(@class,'profile')] | //button[contains(@class,'profile')] | //button[contains(@class,'user')]")
    private WebElement profileMenu;

    public DashboardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        PageFactory.initElements(driver, this);
    }

    public boolean isDashboardDisplayed() {
        try {
            // Wait for URL to change from login page
            wait.until(ExpectedConditions.not(ExpectedConditions.urlContains("/login")));
            
            // Check if we're on a dashboard page (admin, doctor, or user dashboard)
            return driver.getCurrentUrl().contains("/dashboard") || 
                   driver.getCurrentUrl().contains("/admin") || 
                   driver.getCurrentUrl().contains("/doctor");
        } catch (Exception e) {
            System.out.println("Dashboard check failed: " + e.getMessage());
            System.out.println("Current URL: " + driver.getCurrentUrl());
            return false;
        }
    }

    public void clickLogout() throws InterruptedException {
        // Wait a bit for the page to fully load and any modals to close
        Thread.sleep(2000);
        
        try {
            // Wait for logout button to be clickable
            wait.until(ExpectedConditions.elementToBeClickable(logoutButton));
            
            // Scroll into view
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", logoutButton);
            Thread.sleep(500);
            
            // Try regular click first
            try {
                logoutButton.click();
                System.out.println("✓ Logout button clicked (regular click)");
            } catch (Exception e) {
                // If regular click fails, use JavaScript click
                System.out.println("Regular click failed, using JavaScript click for logout");
                ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", logoutButton);
                System.out.println("✓ Logout button clicked (JavaScript click)");
            }
            
            // Wait for logout to complete
            Thread.sleep(1000);
            
        } catch (Exception e) {
            System.out.println("⚠ Could not find logout button with standard locator");
            System.out.println("Current URL: " + driver.getCurrentUrl());
            throw e;
        }
    }

    public String getDashboardTitle() {
        return driver.getTitle();
    }
}
