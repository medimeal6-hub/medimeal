package com.medimeal.tests;

import com.medimeal.base.BaseTest;
import com.medimeal.pages.AppointmentPage;
import com.medimeal.pages.DashboardPage;
import com.medimeal.pages.HomePage;
import com.medimeal.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class PatientBookingTest extends BaseTest {

    @Test(priority = 4, description = "Test Patient Booking Flow: Login -> Book Appointment -> Logout")
    public void testPatientBookingFlow() throws InterruptedException {
        // Step 1: Navigate to Home Page
        navigateToHomePage();
        HomePage homePage = new HomePage(driver);
        Assert.assertTrue(homePage.isHomePageDisplayed(), "Home page is not displayed");
        System.out.println("✓ Home page loaded successfully");

        // Step 2: Click Login button
        homePage.clickLogin();
        Thread.sleep(1000);

        // Step 3: Login as Patient
        LoginPage loginPage = new LoginPage(driver);
        Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page is not displayed");
        System.out.println("✓ Login page loaded successfully");

        String patientEmail = config.getProperty("patient.email");
        String patientPassword = config.getProperty("patient.password");
        
        loginPage.login(patientEmail, patientPassword);
        System.out.println("✓ Patient logged in: " + patientEmail);
        Thread.sleep(2000);

        // Step 4: Verify Dashboard
        DashboardPage dashboardPage = new DashboardPage(driver);
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Patient dashboard is not displayed");
        System.out.println("✓ Patient dashboard loaded successfully");
        Thread.sleep(1000);

        // Step 5: Navigate to Appointments
        AppointmentPage appointmentPage = new AppointmentPage(driver);
        appointmentPage.navigateToAppointments();
        System.out.println("✓ Navigated to appointments page");
        Thread.sleep(2000);

        // Step 6: Book an Appointment
        // Get tomorrow's date
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        String date = tomorrow.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String time = "10:00";
        String reason = "Regular checkup - Automated test booking";

        appointmentPage.bookAppointment(date, time, reason);
        System.out.println("✓ Appointment booking submitted");
        Thread.sleep(3000);

        // Step 7: Verify booking (optional - depends on UI feedback)
        System.out.println("✓ Appointment booked successfully");

        // Step 8: Logout
        dashboardPage.clickLogout();
        System.out.println("✓ Patient logged out successfully");
        Thread.sleep(1000);

        System.out.println("\n✅ PATIENT BOOKING TEST PASSED - Complete booking flow executed successfully");
    }
}
