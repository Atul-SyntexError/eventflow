package com.eventflow.controller;

import com.eventflow.dto.EventDetailDto;
import com.eventflow.dto.EventFormRequestDto;
import com.eventflow.dto.EventSummaryDto;
import com.eventflow.model.EventStatus;
import com.eventflow.service.AdminEventService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.JsonPayloadMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebServlet(urlPatterns = {"/admin/events", "/admin/events/*"})
public final class AdminEventsPageController extends HttpServlet {

  private static final Pattern EDIT_PATH_PATTERN = Pattern.compile("^/([0-9]+)/edit/?$");
  private static final String VIEW_PATH = "/WEB-INF/views/admin/events.jsp";

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String pathInfo = request.getPathInfo();
    String initialMode = "list";
    String selectedEventId = null;

    if (pathInfo == null || "/".equals(pathInfo)) {
      initialMode = "list";
    } else if ("/new".equals(pathInfo) || "/new/".equals(pathInfo)) {
      initialMode = "create";
    } else {
      Matcher matcher = EDIT_PATH_PATTERN.matcher(pathInfo);
      if (!matcher.matches()) {
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }

      initialMode = "edit";
      selectedEventId = matcher.group(1);
    }

    AdminEventService adminEventService = AppComponentFactory.adminEventService(getServletContext());
    JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
    List<EventSummaryDto> events = adminEventService.listEvents();
    List<EventDetailDto> details = events.stream()
        .map(event -> adminEventService.getEventDetail(event.eventId()))
        .toList();

    request.setAttribute("eventInitialMode", initialMode);
    request.setAttribute("eventSelectedId", selectedEventId);
    request.setAttribute(
        "adminEventManagementBootstrapJson",
        jsonPayloadMapper.write(buildBootstrapDataset(events, details)));
    request.getRequestDispatcher(VIEW_PATH).forward(request, response);
  }

  private Map<String, Object> buildBootstrapDataset(List<EventSummaryDto> events, List<EventDetailDto> details) {
    Map<String, Object> dataset = new LinkedHashMap<>();
    dataset.put("summary", buildSummary(events));
    dataset.put("filterOptions", buildFilterOptions(events));
    dataset.put("events", events);
    dataset.put("details", details);
    dataset.put("createTemplate", new EventFormRequestDto(
        "",
        "",
        "Conference",
        "",
        null,
        null,
        null,
        null,
        0,
        List.of(),
        EventStatus.DRAFT));
    return dataset;
  }

  private Map<String, Object> buildSummary(List<EventSummaryDto> events) {
    long liveEvents = events.stream().filter(event -> event.status() == EventStatus.LIVE).count();
    long draftEvents = events.stream().filter(event -> event.status() == EventStatus.DRAFT).count();
    long attentionRequired = events.stream()
        .filter(event -> event.riskLevel() != null && ("HIGH".equals(event.riskLevel().name()) || "CRITICAL".equals(event.riskLevel().name())))
        .count();

    return Map.of(
        "totalEvents", events.size(),
        "liveEvents", liveEvents,
        "draftEvents", draftEvents,
        "attentionRequired", attentionRequired);
  }

  private Map<String, Object> buildFilterOptions(List<EventSummaryDto> events) {
    List<String> statuses = new ArrayList<>();
    statuses.add("ALL");
    statuses.addAll(events.stream()
        .map(event -> event.status().name())
        .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll));

    List<String> categories = new ArrayList<>();
    categories.add("ALL");
    categories.addAll(events.stream()
        .map(EventSummaryDto::category)
        .filter(category -> category != null && !category.isBlank())
        .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll));

    return Map.of(
        "statuses", statuses,
        "categories", categories,
        "riskLevels", List.of("ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"));
  }
}