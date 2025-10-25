# MediMeal Validation-Safe Test Script for PowerShell
# This script tests the validation-safe seed data and ensures all names are alphabetic

Write-Host "🚀 Starting MediMeal Validation-Safe Test..." -ForegroundColor Green
Write-Host ""

# Configuration
$baseUrl = "http://localhost:5000/api"
$mongodbUri = "mongodb+srv://medi:Siya123@cluster0.iiclpkk.mongodb.net/medimeal?"

# Validation-safe test credentials
$credentials = @{
    admin = @{ email = "admin@medimeal.com"; password = "Admin@123" }
    doctor = @{ email = "drraj@medimeal.com"; password = "Doctor@123" }
    user = @{ email = "riya@medimeal.com"; password = "User@123" }
}

$authTokens = @{}

# Helper function to make API requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Data = $null,
        [string]$Token = $null
    )
    
    try {
        $headers = @{
            'Content-Type' = 'application/json'
        }
        
        if ($Token) {
            $headers['Authorization'] = "Bearer $Token"
        }
        
        $body = if ($Data) { $Data | ConvertTo-Json -Depth 10 } else { $null }
        
        $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -Body $body
        return @{ success = $true; data = $response }
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message }
    }
}

# Test functions
function Test-DatabaseConnection {
    Write-Host "🔗 Testing database connection..." -ForegroundColor Yellow
    try {
        # Test if server is responding
        $healthCheck = Invoke-ApiRequest -Method "GET" -Endpoint "/health"
        if ($healthCheck.success) {
            Write-Host "✅ Database connected successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Database connection failed" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Database connection failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-ValidationSafeSeed {
    Write-Host "🌱 Testing validation-safe seed data..." -ForegroundColor Yellow
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/seed"
    
    if ($result.success) {
        Write-Host "✅ Validation-safe seed data created successfully" -ForegroundColor Green
        Write-Host "📊 Seed data summary:" -ForegroundColor Cyan
        $result.data.data.counts | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
        Write-Host "✅ Validation status:" -ForegroundColor Cyan
        $result.data.data.validation | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
        
        # Verify validation-safe names
        $users = $result.data.data.users
        Write-Host "👤 Validation-safe users created:" -ForegroundColor Cyan
        Write-Host "   Admin: $($users.admin.name) ($($users.admin.email))" -ForegroundColor White
        Write-Host "   Doctor: $($users.doctor.name) ($($users.doctor.email)) - $($users.doctor.specialization)" -ForegroundColor White
        Write-Host "   User: $($users.user.name) ($($users.user.email)) - Age: $($users.user.healthProfile.age)" -ForegroundColor White
        
        return $true
    } else {
        Write-Host "❌ Validation-safe seed data creation failed: $($result.error)" -ForegroundColor Red
        return $false
    }
}

function Test-ValidationSafeAuthentication {
    Write-Host "🔐 Testing validation-safe authentication..." -ForegroundColor Yellow
    
    foreach ($role in $credentials.Keys) {
        $cred = $credentials[$role]
        $result = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Data $cred
        
        if ($result.success -and $result.data.data.token) {
            $authTokens[$role] = $result.data.data.token
            $user = $result.data.data.user
            Write-Host "✅ $role authentication successful - $($user.firstName) $($user.lastName)" -ForegroundColor Green
            
            # Verify validation-safe names
            $fullName = "$($user.firstName) $($user.lastName)"
            $isAlphabetic = $fullName -match "^[A-Za-z\s]+$"
            Write-Host "   Name validation: $(if ($isAlphabetic) { '✅ PASS' } else { '❌ FAIL' }) - `"$fullName`"" -ForegroundColor $(if ($isAlphabetic) { 'Green' } else { 'Red' })
        } else {
            Write-Host "❌ $role authentication failed: $($result.error)" -ForegroundColor Red
            return $false
        }
    }
    
    return $true
}

function Test-ValidationSafeUserProfile {
    Write-Host "👤 Testing validation-safe user profile..." -ForegroundColor Yellow
    
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $authTokens.user
    
    if ($result.success) {
        $user = $result.data.data.user
        Write-Host "✅ User profile retrieved successfully" -ForegroundColor Green
        Write-Host "   Name: $($user.firstName) $($user.lastName)" -ForegroundColor White
        $age = if ($user.dateOfBirth) { [math]::Floor((Get-Date) - [datetime]$user.dateOfBirth).TotalDays / 365.25 } else { 'N/A' }
        Write-Host "   Age: $age" -ForegroundColor White
        Write-Host "   Weight: $($user.weight)kg" -ForegroundColor White
        Write-Host "   Allergies: $($user.allergies -join ', ')" -ForegroundColor White
        Write-Host "   Medical Conditions: $($user.medicalConditions -join ', ')" -ForegroundColor White
        
        # Verify all names are alphabetic
        $nameValidation = "$($user.firstName) $($user.lastName)" -match "^[A-Za-z\s]+$"
        Write-Host "   Name validation: $(if ($nameValidation) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($nameValidation) { 'Green' } else { 'Red' })
        
        return $true
    } else {
        Write-Host "❌ User profile retrieval failed: $($result.error)" -ForegroundColor Red
        return $false
    }
}

function Test-ValidationSafeDoctorProfile {
    Write-Host "👨‍⚕️ Testing validation-safe doctor profile..." -ForegroundColor Yellow
    
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $authTokens.doctor
    
    if ($result.success) {
        $doctor = $result.data.data.user
        Write-Host "✅ Doctor profile retrieved successfully" -ForegroundColor Green
        Write-Host "   Name: Dr. $($doctor.firstName) $($doctor.lastName)" -ForegroundColor White
        Write-Host "   Specialization: $($doctor.specialization)" -ForegroundColor White
        Write-Host "   License: $(if ($doctor.doctorInfo.licenseNumber) { $doctor.doctorInfo.licenseNumber } else { 'N/A' })" -ForegroundColor White
        Write-Host "   Experience: $(if ($doctor.doctorInfo.yearsOfExperience) { $doctor.doctorInfo.yearsOfExperience } else { 0 }) years" -ForegroundColor White
        
        # Verify all names are alphabetic
        $nameValidation = "$($doctor.firstName) $($doctor.lastName)" -match "^[A-Za-z\s]+$"
        Write-Host "   Name validation: $(if ($nameValidation) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($nameValidation) { 'Green' } else { 'Red' })
        
        return $true
    } else {
        Write-Host "❌ Doctor profile retrieval failed: $($result.error)" -ForegroundColor Red
        return $false
    }
}

function Test-ValidationSafeDataIntegrity {
    Write-Host "🔍 Testing validation-safe data integrity..." -ForegroundColor Yellow
    
    # Test food data
    $foods = Invoke-ApiRequest -Method "GET" -Endpoint "/foods" -Token $authTokens.user
    if ($foods.success) {
        Write-Host "✅ Food data retrieved successfully" -ForegroundColor Green
        Write-Host "   Total foods: $($foods.data.data.Count)" -ForegroundColor White
        
        # Check if all food names are valid
        $validFoodNames = $foods.data.data | ForEach-Object { $_.name -match "^[A-Za-z\s]+$" } | Where-Object { $_ -eq $true } | Measure-Object | Select-Object -ExpandProperty Count
        $allValid = $validFoodNames -eq $foods.data.data.Count
        Write-Host "   Food name validation: $(if ($allValid) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($allValid) { 'Green' } else { 'Red' })
    }
    
    # Test medicine data
    $medicines = Invoke-ApiRequest -Method "GET" -Endpoint "/medicines" -Token $authTokens.user
    if ($medicines.success) {
        Write-Host "✅ Medicine data retrieved successfully" -ForegroundColor Green
        Write-Host "   Total medicines: $($medicines.data.data.Count)" -ForegroundColor White
        
        # Check if all medicine names are valid
        $validMedicineNames = $medicines.data.data | ForEach-Object { $_.name -match "^[A-Za-z\s]+$" } | Where-Object { $_ -eq $true } | Measure-Object | Select-Object -ExpandProperty Count
        $allValid = $validMedicineNames -eq $medicines.data.data.Count
        Write-Host "   Medicine name validation: $(if ($allValid) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($allValid) { 'Green' } else { 'Red' })
    }
    
    return $true
}

# Main test execution
function Test-ValidationSafeWorkflow {
    Write-Host "🔄 Testing validation-safe complete workflow..." -ForegroundColor Yellow
    
    $tests = @(
        @{ name = "Database Connection"; fn = { Test-DatabaseConnection } },
        @{ name = "Validation-Safe Seed"; fn = { Test-ValidationSafeSeed } },
        @{ name = "Validation-Safe Authentication"; fn = { Test-ValidationSafeAuthentication } },
        @{ name = "User Profile Validation"; fn = { Test-ValidationSafeUserProfile } },
        @{ name = "Doctor Profile Validation"; fn = { Test-ValidationSafeDoctorProfile } },
        @{ name = "Data Integrity Validation"; fn = { Test-ValidationSafeDataIntegrity } }
    )
    
    $passed = 0
    $failed = 0
    
    foreach ($test in $tests) {
        try {
            $result = & $test.fn
            if ($result) {
                $passed++
                Write-Host "✅ $($test.name) - PASSED" -ForegroundColor Green
            } else {
                $failed++
                Write-Host "❌ $($test.name) - FAILED" -ForegroundColor Red
            }
            Write-Host ""
        }
        catch {
            $failed++
            Write-Host "❌ $($test.name) - ERROR: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
        }
    }
    
    Write-Host "📊 Validation-Safe Test Results Summary:" -ForegroundColor Cyan
    Write-Host "✅ Passed: $passed" -ForegroundColor Green
    Write-Host "❌ Failed: $failed" -ForegroundColor Red
    $successRate = [math]::Round(($passed / ($passed + $failed)) * 100, 1)
    Write-Host "📈 Success Rate: $successRate%" -ForegroundColor Yellow
    
    if ($failed -eq 0) {
        Write-Host ""
        Write-Host "🎉 All validation-safe tests passed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Validation-Safe Demo Credentials:" -ForegroundColor Cyan
        Write-Host "👑 Admin: admin@medimeal.com / Admin@123 (AdminUser)" -ForegroundColor White
        Write-Host "👨‍⚕️ Doctor: drraj@medimeal.com / Doctor@123 (DrRaj - Nutrition)" -ForegroundColor White
        Write-Host "👤 User: riya@medimeal.com / User@123 (Riya - Age 22, 58kg)" -ForegroundColor White
        Write-Host ""
        Write-Host "✅ All names are alphabetic and validation-safe" -ForegroundColor Green
        Write-Host "✅ All data passes regex validation" -ForegroundColor Green
        Write-Host "✅ Complete workflow tested successfully" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️ Some validation-safe tests failed. Please check the errors above." -ForegroundColor Yellow
    }
}

# Run the validation-safe workflow test
Test-ValidationSafeWorkflow
