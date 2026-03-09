package com.medimeal.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class HomePage {
    private WebDriver driver;
    private WebDriverWait wait;

    @FindBy(xpath = "//a[contains(text(),'Sign In') or @href='/login']")
    private WebElement loginButton;

    @FindBy(xpath = "//button[contains(text(),'Get Started')]")
    private WebElement getStartedButton;

    public HomePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        PageFactory.initElements(driver, this);
    }

    public void clickLogin() {
        wait.until(ExpectedConditions.elementToBeClickable(loginButton));
        loginButton.click();
    }

    public boolean isHomePageDisplayed() {
        try {
            return driver.getTitle().contains("MediMeal") || 
                   driver.getCurrentUrl().contains("localhost");
        } catch (Exception e) {
            return false;
        }
    }
}
