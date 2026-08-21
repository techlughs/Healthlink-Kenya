package com.healthlink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {
    private double totalRevenue;
    private long totalAppointments;
    private long uniquePatients;
    private long activeDoctors;
    private double avgFee;
    private List<MonthlyRevenue> monthlyRevenue;
    private List<StatusCount> statusBreakdown;
    private List<WeekdayCount> weekdayVolume;
    private List<DoctorLeaderboardEntry> topDoctors;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String label;
        private double revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCount {
        private String name;
        private long value;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeekdayCount {
        private String day;
        private long appointments;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorLeaderboardEntry {
        private String doctorName;
        private double revenue;
        private long completedVisits;
    }
}