package com.healthlink.backend.service;

import com.healthlink.backend.dto.AdminAnalyticsResponse;
import com.healthlink.backend.model.Appointment;
import com.healthlink.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminAnalyticsService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public AdminAnalyticsResponse getPlatformAnalytics() {
        List<Appointment> appointments = appointmentRepository.findAll();

        List<Appointment> completed = appointments.stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .collect(Collectors.toList());

        double totalRevenue = completed.stream()
                .mapToDouble(this::feeOf)
                .sum();

        long uniquePatients = appointments.stream()
                .map(Appointment::getPatientId)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        long activeDoctors = appointments.stream()
                .map(Appointment::getDoctorId)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        double avgFee = completed.isEmpty() ? 0 : totalRevenue / completed.size();

        return new AdminAnalyticsResponse(
                totalRevenue,
                appointments.size(),
                uniquePatients,
                activeDoctors,
                avgFee,
                buildMonthlyRevenue(completed),
                buildStatusBreakdown(appointments),
                buildWeekdayVolume(appointments),
                buildTopDoctors(completed)
        );
    }

    private double feeOf(Appointment a) {
        Double fee = a.getFee();
        return fee == null ? 0.0 : fee;
    }

    private List<AdminAnalyticsResponse.MonthlyRevenue> buildMonthlyRevenue(List<Appointment> completed) {
        LocalDate now = LocalDate.now();
        LinkedHashMap<String, Double> months = new LinkedHashMap<>();
        LinkedHashMap<String, String> labels = new LinkedHashMap<>();

        for (int i = 5; i >= 0; i--) {
            LocalDate d = now.minusMonths(i).withDayOfMonth(1);
            String key = d.getYear() + "-" + d.getMonthValue();
            String label = d.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + String.valueOf(d.getYear()).substring(2);
            months.put(key, 0.0);
            labels.put(key, label);
        }

        for (Appointment a : completed) {
            if (a.getAppointmentDateTime() == null) continue;
            LocalDate d = a.getAppointmentDateTime().toLocalDate();
            String key = d.getYear() + "-" + d.getMonthValue();
            Double existing = months.get(key);
            if (existing != null) {
                months.put(key, existing + feeOf(a));
            }
        }

        List<AdminAnalyticsResponse.MonthlyRevenue> result = new ArrayList<>();
        for (Map.Entry<String, String> entry : labels.entrySet()) {
            result.add(new AdminAnalyticsResponse.MonthlyRevenue(entry.getValue(), months.get(entry.getKey())));
        }
        return result;
    }

    private List<AdminAnalyticsResponse.StatusCount> buildStatusBreakdown(List<Appointment> appointments) {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("Pending", 0L);
        counts.put("Confirmed", 0L);
        counts.put("Completed", 0L);
        counts.put("Cancelled", 0L);

        for (Appointment a : appointments) {
            if (a.getStatus() == null) continue;
            String key = a.getStatus().substring(0, 1).toUpperCase() + a.getStatus().substring(1).toLowerCase();
            Long existing = counts.get(key);
            if (existing != null) {
                counts.put(key, existing + 1);
            }
        }

        return counts.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .map(e -> new AdminAnalyticsResponse.StatusCount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    private List<AdminAnalyticsResponse.WeekdayCount> buildWeekdayVolume(List<Appointment> appointments) {
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        long[] counts = new long[7];

        for (Appointment a : appointments) {
            if (a.getAppointmentDateTime() == null) continue;
            if ("CANCELLED".equalsIgnoreCase(a.getStatus())) continue;
            DayOfWeek dow = a.getAppointmentDateTime().getDayOfWeek();
            counts[dow.getValue() - 1]++;
        }

        List<AdminAnalyticsResponse.WeekdayCount> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            result.add(new AdminAnalyticsResponse.WeekdayCount(days[i], counts[i]));
        }
        return result;
    }

    private List<AdminAnalyticsResponse.DoctorLeaderboardEntry> buildTopDoctors(List<Appointment> completed) {
        Map<String, Double> revenueByDoctor = new LinkedHashMap<>();
        Map<String, Long> visitsByDoctor = new LinkedHashMap<>();

        for (Appointment a : completed) {
            String name = a.getDoctorName() != null ? a.getDoctorName() : "Unknown";
            revenueByDoctor.merge(name, feeOf(a), Double::sum);
            visitsByDoctor.merge(name, 1L, Long::sum);
        }

        return revenueByDoctor.entrySet().stream()
                .map(e -> new AdminAnalyticsResponse.DoctorLeaderboardEntry(
                        e.getKey(), e.getValue(), visitsByDoctor.get(e.getKey())))
                .sorted((a1, b1) -> Double.compare(b1.getRevenue(), a1.getRevenue()))
                .limit(5)
                .collect(Collectors.toList());
    }
}